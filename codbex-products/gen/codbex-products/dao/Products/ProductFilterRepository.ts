import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface ProductFilterEntity {
    readonly Id: number;
    Name?: string;
    Type?: number;
    Product?: number;
}

export interface ProductFilterCreateEntity {
    readonly Name?: string;
    readonly Type?: number;
    readonly Product?: number;
}

export interface ProductFilterUpdateEntity extends ProductFilterCreateEntity {
    readonly Id: number;
}

export interface ProductFilterEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Name?: string | string[];
            Type?: number | number[];
            Product?: number | number[];
        };
        notEquals?: {
            Id?: number | number[];
            Name?: string | string[];
            Type?: number | number[];
            Product?: number | number[];
        };
        contains?: {
            Id?: number;
            Name?: string;
            Type?: number;
            Product?: number;
        };
        greaterThan?: {
            Id?: number;
            Name?: string;
            Type?: number;
            Product?: number;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Name?: string;
            Type?: number;
            Product?: number;
        };
        lessThan?: {
            Id?: number;
            Name?: string;
            Type?: number;
            Product?: number;
        };
        lessThanOrEqual?: {
            Id?: number;
            Name?: string;
            Type?: number;
            Product?: number;
        };
    },
    $select?: (keyof ProductFilterEntity)[],
    $sort?: string | (keyof ProductFilterEntity)[],
    $order?: 'ASC' | 'DESC',
    $offset?: number,
    $limit?: number,
}

interface ProductFilterEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<ProductFilterEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface ProductFilterUpdateEntityEvent extends ProductFilterEntityEvent {
    readonly previousEntity: ProductFilterEntity;
}

export class ProductFilterRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_PRODUCTFILTER",
        properties: [
            {
                name: "Id",
                column: "PRODUCTFILTER_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Name",
                column: "PRODUCTFILTER_NAME",
                type: "VARCHAR",
            },
            {
                name: "Type",
                column: "PRODUCTFILTER_TYPE",
                type: "INTEGER",
            },
            {
                name: "Product",
                column: "PRODUCTFILTER_PRODUCT",
                type: "INTEGER",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(ProductFilterRepository.DEFINITION, undefined, dataSource);
    }

    public findAll(options: ProductFilterEntityOptions = {}): ProductFilterEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): ProductFilterEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: ProductFilterCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_PRODUCTFILTER",
            entity: entity,
            key: {
                name: "Id",
                column: "PRODUCTFILTER_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: ProductFilterUpdateEntity): void {
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_PRODUCTFILTER",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "PRODUCTFILTER_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: ProductFilterCreateEntity | ProductFilterUpdateEntity): number {
        const id = (entity as ProductFilterUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as ProductFilterUpdateEntity);
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
            table: "CODBEX_PRODUCTFILTER",
            entity: entity,
            key: {
                name: "Id",
                column: "PRODUCTFILTER_ID",
                value: id
            }
        });
    }

    public count(options?: ProductFilterEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_PRODUCTFILTER"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: ProductFilterEntityEvent | ProductFilterUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-products-Products-ProductFilter", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-products-Products-ProductFilter").send(JSON.stringify(data));
    }
}
