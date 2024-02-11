import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface ProductTypeEntity {
    readonly Id: number;
    Name?: string;
}

export interface ProductTypeCreateEntity {
    readonly Name?: string;
}

export interface ProductTypeUpdateEntity extends ProductTypeCreateEntity {
    readonly Id: number;
}

export interface ProductTypeEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Name?: string | string[];
        };
        notEquals?: {
            Id?: number | number[];
            Name?: string | string[];
        };
        contains?: {
            Id?: number;
            Name?: string;
        };
        greaterThan?: {
            Id?: number;
            Name?: string;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Name?: string;
        };
        lessThan?: {
            Id?: number;
            Name?: string;
        };
        lessThanOrEqual?: {
            Id?: number;
            Name?: string;
        };
    },
    $select?: (keyof ProductTypeEntity)[],
    $sort?: string | (keyof ProductTypeEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface ProductTypeEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<ProductTypeEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export class ProductTypeRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_PRODUCTTYPE",
        properties: [
            {
                name: "Id",
                column: "PRODUCTTYPE_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Name",
                column: "PRODUCTTYPE_NAME",
                type: "VARCHAR",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource?: string) {
        this.dao = daoApi.create(ProductTypeRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: ProductTypeEntityOptions): ProductTypeEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): ProductTypeEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: ProductTypeCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_PRODUCTTYPE",
            entity: entity,
            key: {
                name: "Id",
                column: "PRODUCTTYPE_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: ProductTypeUpdateEntity): void {
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_PRODUCTTYPE",
            entity: entity,
            key: {
                name: "Id",
                column: "PRODUCTTYPE_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: ProductTypeCreateEntity | ProductTypeUpdateEntity): number {
        const id = (entity as ProductTypeUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as ProductTypeUpdateEntity);
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
            table: "CODBEX_PRODUCTTYPE",
            entity: entity,
            key: {
                name: "Id",
                column: "PRODUCTTYPE_ID",
                value: id
            }
        });
    }

    public count(): number {
        return this.dao.count();
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX__PRODUCTTYPE"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: ProductTypeEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-products/Settings/ProductType", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.queue("codbex-products/Settings/ProductType").send(JSON.stringify(data));
    }
}