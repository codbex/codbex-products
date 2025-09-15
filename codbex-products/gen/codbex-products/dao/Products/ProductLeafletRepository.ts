import { sql, query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface ProductLeafletEntity {
    readonly Id: number;
    Title?: number;
    LeafletLink?: string;
}

export interface ProductLeafletCreateEntity {
    readonly Title?: number;
    readonly LeafletLink?: string;
}

export interface ProductLeafletUpdateEntity extends ProductLeafletCreateEntity {
    readonly Id: number;
}

export interface ProductLeafletEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Title?: number | number[];
            LeafletLink?: string | string[];
        };
        notEquals?: {
            Id?: number | number[];
            Title?: number | number[];
            LeafletLink?: string | string[];
        };
        contains?: {
            Id?: number;
            Title?: number;
            LeafletLink?: string;
        };
        greaterThan?: {
            Id?: number;
            Title?: number;
            LeafletLink?: string;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Title?: number;
            LeafletLink?: string;
        };
        lessThan?: {
            Id?: number;
            Title?: number;
            LeafletLink?: string;
        };
        lessThanOrEqual?: {
            Id?: number;
            Title?: number;
            LeafletLink?: string;
        };
    },
    $select?: (keyof ProductLeafletEntity)[],
    $sort?: string | (keyof ProductLeafletEntity)[],
    $order?: 'ASC' | 'DESC',
    $offset?: number,
    $limit?: number,
    $language?: string
}

export interface ProductLeafletEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<ProductLeafletEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export interface ProductLeafletUpdateEntityEvent extends ProductLeafletEntityEvent {
    readonly previousEntity: ProductLeafletEntity;
}

export class ProductLeafletRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_PRODUCTLEAFLET",
        properties: [
            {
                name: "Id",
                column: "PRODUCTLEAFLET_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Title",
                column: "PRODUCTLEAFLET_TITLE",
                type: "INTEGER",
            },
            {
                name: "LeafletLink",
                column: "PRODUCTLEAFLET_LEAFLETLINK",
                type: "VARCHAR",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(ProductLeafletRepository.DEFINITION, undefined, dataSource);
    }

    public findAll(options: ProductLeafletEntityOptions = {}): ProductLeafletEntity[] {
        let list = this.dao.list(options);
        return list;
    }

    public findById(id: number, options: ProductLeafletEntityOptions = {}): ProductLeafletEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: ProductLeafletCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_PRODUCTLEAFLET",
            entity: entity,
            key: {
                name: "Id",
                column: "PRODUCTLEAFLET_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: ProductLeafletUpdateEntity): void {
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_PRODUCTLEAFLET",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "PRODUCTLEAFLET_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: ProductLeafletCreateEntity | ProductLeafletUpdateEntity): number {
        const id = (entity as ProductLeafletUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as ProductLeafletUpdateEntity);
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
            table: "CODBEX_PRODUCTLEAFLET",
            entity: entity,
            key: {
                name: "Id",
                column: "PRODUCTLEAFLET_ID",
                value: id
            }
        });
    }

    public count(options?: ProductLeafletEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_PRODUCTLEAFLET"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: ProductLeafletEntityEvent | ProductLeafletUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-products-Products-ProductLeaflet", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-products-Products-ProductLeaflet").send(JSON.stringify(data));
    }
}
