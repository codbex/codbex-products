import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface CatalogueEntity {
    readonly Id: number;
    Product: number;
    Store: number;
    Quantity: number;
    BaseUnit?: number;
}

export interface CatalogueCreateEntity {
    readonly Product: number;
    readonly Store: number;
    readonly Quantity: number;
    readonly BaseUnit?: number;
}

export interface CatalogueUpdateEntity extends CatalogueCreateEntity {
    readonly Id: number;
}

export interface CatalogueEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Product?: number | number[];
            Store?: number | number[];
            Quantity?: number | number[];
            BaseUnit?: number | number[];
        };
        notEquals?: {
            Id?: number | number[];
            Product?: number | number[];
            Store?: number | number[];
            Quantity?: number | number[];
            BaseUnit?: number | number[];
        };
        contains?: {
            Id?: number;
            Product?: number;
            Store?: number;
            Quantity?: number;
            BaseUnit?: number;
        };
        greaterThan?: {
            Id?: number;
            Product?: number;
            Store?: number;
            Quantity?: number;
            BaseUnit?: number;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Product?: number;
            Store?: number;
            Quantity?: number;
            BaseUnit?: number;
        };
        lessThan?: {
            Id?: number;
            Product?: number;
            Store?: number;
            Quantity?: number;
            BaseUnit?: number;
        };
        lessThanOrEqual?: {
            Id?: number;
            Product?: number;
            Store?: number;
            Quantity?: number;
            BaseUnit?: number;
        };
    },
    $select?: (keyof CatalogueEntity)[],
    $sort?: string | (keyof CatalogueEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface CatalogueEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<CatalogueEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface CatalogueUpdateEntityEvent extends CatalogueEntityEvent {
    readonly previousEntity: CatalogueEntity;
}

export class CatalogueRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_CATALOGUE",
        properties: [
            {
                name: "Id",
                column: "CATALOGUE_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Product",
                column: "CATALOGUE_PRODUCT",
                type: "INTEGER",
                required: true
            },
            {
                name: "Store",
                column: "CATALOGUE_STORE",
                type: "INTEGER",
                required: true
            },
            {
                name: "Quantity",
                column: "CATALOGUE_QUANTITY",
                type: "DOUBLE",
                required: true
            },
            {
                name: "BaseUnit",
                column: "CATALOGUE_BASEUNIT",
                type: "INTEGER",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(CatalogueRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: CatalogueEntityOptions): CatalogueEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): CatalogueEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: CatalogueCreateEntity): number {
        if (entity.BaseUnit === undefined || entity.BaseUnit === null) {
            (entity as CatalogueEntity).BaseUnit = 17;
        }
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_CATALOGUE",
            entity: entity,
            key: {
                name: "Id",
                column: "CATALOGUE_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: CatalogueUpdateEntity): void {
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_CATALOGUE",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "CATALOGUE_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: CatalogueCreateEntity | CatalogueUpdateEntity): number {
        const id = (entity as CatalogueUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as CatalogueUpdateEntity);
            return id;
        } else {
            return this.create(entity);
        }
    }

    public deleteById(id: number): void {
        const entity = this.dao.find(id);
        this.dao.remove(id);
        this.triggerEvent({
            operation: "delete",
            table: "CODBEX_CATALOGUE",
            entity: entity,
            key: {
                name: "Id",
                column: "CATALOGUE_ID",
                value: id
            }
        });
    }

    public count(options?: CatalogueEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_CATALOGUE"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: CatalogueEntityEvent | CatalogueUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-products-Catalogues-Catalogue", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-products-Catalogues-Catalogue").send(JSON.stringify(data));
    }
}
