import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface ProductAttributeEntity {
    readonly Id: number;
    Product?: number;
    Name?: string;
    Value?: string;
}

export interface ProductAttributeCreateEntity {
    readonly Product?: number;
    readonly Name?: string;
    readonly Value?: string;
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
        };
        notEquals?: {
            Id?: number | number[];
            Product?: number | number[];
            Name?: string | string[];
            Value?: string | string[];
        };
        contains?: {
            Id?: number;
            Product?: number;
            Name?: string;
            Value?: string;
        };
        greaterThan?: {
            Id?: number;
            Product?: number;
            Name?: string;
            Value?: string;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Product?: number;
            Name?: string;
            Value?: string;
        };
        lessThan?: {
            Id?: number;
            Product?: number;
            Name?: string;
            Value?: string;
        };
        lessThanOrEqual?: {
            Id?: number;
            Product?: number;
            Name?: string;
            Value?: string;
        };
    },
    $select?: (keyof ProductAttributeEntity)[],
    $sort?: string | (keyof ProductAttributeEntity)[],
    $order?: 'ASC' | 'DESC',
    $offset?: number,
    $limit?: number,
}

interface ProductAttributeEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<ProductAttributeEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface ProductAttributeUpdateEntityEvent extends ProductAttributeEntityEvent {
    readonly previousEntity: ProductAttributeEntity;
}

export class ProductAttributeRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_PRODUCTDETAILS",
        properties: [
            {
                name: "Id",
                column: "PRODUCTDETAILS_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Product",
                column: "PRODUCTDETAILS_PRODUCTID",
                type: "INTEGER",
            },
            {
                name: "Name",
                column: "PRODUCTDETAILS_NAME",
                type: "VARCHAR",
            },
            {
                name: "Value",
                column: "PRODUCTDETAILS_VALUE",
                type: "VARCHAR",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(ProductAttributeRepository.DEFINITION, undefined, dataSource);
    }

    public findAll(options: ProductAttributeEntityOptions = {}): ProductAttributeEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): ProductAttributeEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: ProductAttributeCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_PRODUCTDETAILS",
            entity: entity,
            key: {
                name: "Id",
                column: "PRODUCTDETAILS_ID",
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
            table: "CODBEX_PRODUCTDETAILS",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "PRODUCTDETAILS_ID",
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
            table: "CODBEX_PRODUCTDETAILS",
            entity: entity,
            key: {
                name: "Id",
                column: "PRODUCTDETAILS_ID",
                value: id
            }
        });
    }

    public count(options?: ProductAttributeEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX__PRODUCTDETAILS"');
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
