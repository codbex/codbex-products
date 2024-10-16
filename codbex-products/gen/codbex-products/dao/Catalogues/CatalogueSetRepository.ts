import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface CatalogueSetEntity {
    readonly Id: number;
    Catalogue?: number;
    ProductSet?: number;
    Quantity?: number;
}

export interface CatalogueSetCreateEntity {
    readonly Catalogue?: number;
    readonly ProductSet?: number;
    readonly Quantity?: number;
}

export interface CatalogueSetUpdateEntity extends CatalogueSetCreateEntity {
    readonly Id: number;
}

export interface CatalogueSetEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Catalogue?: number | number[];
            ProductSet?: number | number[];
            Quantity?: number | number[];
        };
        notEquals?: {
            Id?: number | number[];
            Catalogue?: number | number[];
            ProductSet?: number | number[];
            Quantity?: number | number[];
        };
        contains?: {
            Id?: number;
            Catalogue?: number;
            ProductSet?: number;
            Quantity?: number;
        };
        greaterThan?: {
            Id?: number;
            Catalogue?: number;
            ProductSet?: number;
            Quantity?: number;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Catalogue?: number;
            ProductSet?: number;
            Quantity?: number;
        };
        lessThan?: {
            Id?: number;
            Catalogue?: number;
            ProductSet?: number;
            Quantity?: number;
        };
        lessThanOrEqual?: {
            Id?: number;
            Catalogue?: number;
            ProductSet?: number;
            Quantity?: number;
        };
    },
    $select?: (keyof CatalogueSetEntity)[],
    $sort?: string | (keyof CatalogueSetEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface CatalogueSetEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<CatalogueSetEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface CatalogueSetUpdateEntityEvent extends CatalogueSetEntityEvent {
    readonly previousEntity: CatalogueSetEntity;
}

export class CatalogueSetRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_SET",
        properties: [
            {
                name: "Id",
                column: "SET_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Catalogue",
                column: "SET_CATALOGUE",
                type: "INTEGER",
            },
            {
                name: "ProductSet",
                column: "SET_PRODUCTSET",
                type: "INTEGER",
            },
            {
                name: "Quantity",
                column: "SET_QUANTITY",
                type: "INTEGER",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(CatalogueSetRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: CatalogueSetEntityOptions): CatalogueSetEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): CatalogueSetEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: CatalogueSetCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_SET",
            entity: entity,
            key: {
                name: "Id",
                column: "SET_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: CatalogueSetUpdateEntity): void {
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_SET",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "SET_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: CatalogueSetCreateEntity | CatalogueSetUpdateEntity): number {
        const id = (entity as CatalogueSetUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as CatalogueSetUpdateEntity);
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
            table: "CODBEX_SET",
            entity: entity,
            key: {
                name: "Id",
                column: "SET_ID",
                value: id
            }
        });
    }

    public count(options?: CatalogueSetEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_SET"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: CatalogueSetEntityEvent | CatalogueSetUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-products-Catalogues-CatalogueSet", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-products-Catalogues-CatalogueSet").send(JSON.stringify(data));
    }
}
