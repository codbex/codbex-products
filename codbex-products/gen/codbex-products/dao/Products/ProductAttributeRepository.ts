import { sql, query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface ProductAttributeEntity {
    readonly Id: number;
    Product?: number;
    Name?: string;
    Value?: string;
    Group?: number;
}

export interface ProductAttributeCreateEntity {
    readonly Product?: number;
    readonly Name?: string;
    readonly Value?: string;
    readonly Group?: number;
}

export interface ProductAttributeUpdateEntity extends ProductAttributeCreateEntity {
    readonly Id: number;
}

export interface ProductAttributeEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Product?: number | number[];
            Name?: string | string[];
            Value?: string | string[];
            Group?: number | number[];
        };
        notEquals?: {
            Id?: number | number[];
            Product?: number | number[];
            Name?: string | string[];
            Value?: string | string[];
            Group?: number | number[];
        };
        contains?: {
            Id?: number;
            Product?: number;
            Name?: string;
            Value?: string;
            Group?: number;
        };
        greaterThan?: {
            Id?: number;
            Product?: number;
            Name?: string;
            Value?: string;
            Group?: number;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Product?: number;
            Name?: string;
            Value?: string;
            Group?: number;
        };
        lessThan?: {
            Id?: number;
            Product?: number;
            Name?: string;
            Value?: string;
            Group?: number;
        };
        lessThanOrEqual?: {
            Id?: number;
            Product?: number;
            Name?: string;
            Value?: string;
            Group?: number;
        };
    },
    $select?: (keyof ProductAttributeEntity)[],
    $sort?: string | (keyof ProductAttributeEntity)[],
    $order?: 'ASC' | 'DESC',
    $offset?: number,
    $limit?: number,
    $language?: string
}

export interface ProductAttributeEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<ProductAttributeEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export interface ProductAttributeUpdateEntityEvent extends ProductAttributeEntityEvent {
    readonly previousEntity: ProductAttributeEntity;
}

export class ProductAttributeRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_PRODUCTATTRIBUTE",
        properties: [
            {
                name: "Id",
                column: "PRODUCTATTRIBUTE_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Product",
                column: "PRODUCTATTRIBUTE_PRODUCT",
                type: "INTEGER",
            },
            {
                name: "Name",
                column: "PRODUCTATTRIBUTE_NAME",
                type: "VARCHAR",
            },
            {
                name: "Value",
                column: "PRODUCTATTRIBUTE_VALUE",
                type: "VARCHAR",
            },
            {
                name: "Group",
                column: "PRODUCTATTRIBUTE_GROUP",
                type: "INTEGER",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(ProductAttributeRepository.DEFINITION, undefined, dataSource);
    }

    public findAll(options: ProductAttributeEntityOptions = {}): ProductAttributeEntity[] {
        let list = this.dao.list(options);
        return list;
    }

    public findById(id: number, options: ProductAttributeEntityOptions = {}): ProductAttributeEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: ProductAttributeCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_PRODUCTATTRIBUTE",
            entity: entity,
            key: {
                name: "Id",
                column: "PRODUCTATTRIBUTE_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: ProductAttributeUpdateEntity): void {
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_PRODUCTATTRIBUTE",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "PRODUCTATTRIBUTE_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: ProductAttributeCreateEntity | ProductAttributeUpdateEntity): number {
        const id = (entity as ProductAttributeUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as ProductAttributeUpdateEntity);
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
            table: "CODBEX_PRODUCTATTRIBUTE",
            entity: entity,
            key: {
                name: "Id",
                column: "PRODUCTATTRIBUTE_ID",
                value: id
            }
        });
    }

    public count(options?: ProductAttributeEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX__PRODUCTATTRIBUTE"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: ProductAttributeEntityEvent | ProductAttributeUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-products-Products-ProductAttribute", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-products-Products-ProductAttribute").send(JSON.stringify(data));
    }
}
