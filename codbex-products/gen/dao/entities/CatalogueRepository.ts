import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface CatalogEntity {
    readonly Id: number;
    Product?: number;
    Store: number;
    Quantity?: number;
}

export interface CatalogCreateEntity {
    readonly Product?: number;
    readonly Store: number;
    readonly Quantity?: number;
}

export interface CatalogUpdateEntity extends CatalogCreateEntity {
    readonly Id: number;
}

export interface CatalogEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Product?: number | number[];
            Store?: number | number[];
            Quantity?: number | number[];
        };
        notEquals?: {
            Id?: number | number[];
            Product?: number | number[];
            Store?: number | number[];
            Quantity?: number | number[];
        };
        contains?: {
            Id?: number;
            Product?: number;
            Store?: number;
            Quantity?: number;
        };
        greaterThan?: {
            Id?: number;
            Product?: number;
            Store?: number;
            Quantity?: number;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Product?: number;
            Store?: number;
            Quantity?: number;
        };
        lessThan?: {
            Id?: number;
            Product?: number;
            Store?: number;
            Quantity?: number;
        };
        lessThanOrEqual?: {
            Id?: number;
            Product?: number;
            Store?: number;
            Quantity?: number;
        };
    },
    $select?: (keyof CatalogEntity)[],
    $sort?: string | (keyof CatalogEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface CatalogEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<CatalogEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface CatalogUpdateEntityEvent extends CatalogEntityEvent {
    readonly previousEntity: CatalogEntity;
}

export class CatalogueRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_CATALOG",
        properties: [
            {
                name: "Id",
                column: "CATALOG_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Product",
                column: "CATALOG_PRODUCT",
                type: "INTEGER",
            },
            {
                name: "Store",
                column: "CATALOG_STORE",
                type: "INTEGER",
                required: true
            },
            {
                name: "Quantity",
                column: "CATALOG_QUANTITY",
                type: "DOUBLE",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(CatalogueRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: CatalogEntityOptions): CatalogEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): CatalogEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: CatalogCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_CATALOG",
            entity: entity,
            key: {
                name: "Id",
                column: "CATALOG_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: CatalogUpdateEntity): void {
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_CATALOG",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "CATALOG_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: CatalogCreateEntity | CatalogUpdateEntity): number {
        const id = (entity as CatalogUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as CatalogUpdateEntity);
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
            table: "CODBEX_CATALOG",
            entity: entity,
            key: {
                name: "Id",
                column: "CATALOG_ID",
                value: id
            }
        });
    }

    public count(options?: CatalogEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_CATALOG"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: CatalogEntityEvent | CatalogUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-products-entities-Catalog", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-products-entities-Catalog").send(JSON.stringify(data));
    }
}
