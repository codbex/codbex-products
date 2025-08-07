import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface ProductCategoryEntity {
    readonly Id: number;
    Name?: string;
    Path?: string;
}

export interface ProductCategoryCreateEntity {
    readonly Name?: string;
    readonly Path?: string;
}

export interface ProductCategoryUpdateEntity extends ProductCategoryCreateEntity {
    readonly Id: number;
}

export interface ProductCategoryEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Name?: string | string[];
            Path?: string | string[];
        };
        notEquals?: {
            Id?: number | number[];
            Name?: string | string[];
            Path?: string | string[];
        };
        contains?: {
            Id?: number;
            Name?: string;
            Path?: string;
        };
        greaterThan?: {
            Id?: number;
            Name?: string;
            Path?: string;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Name?: string;
            Path?: string;
        };
        lessThan?: {
            Id?: number;
            Name?: string;
            Path?: string;
        };
        lessThanOrEqual?: {
            Id?: number;
            Name?: string;
            Path?: string;
        };
    },
    $select?: (keyof ProductCategoryEntity)[],
    $sort?: string | (keyof ProductCategoryEntity)[],
    $order?: 'ASC' | 'DESC',
    $offset?: number,
    $limit?: number,
}

export interface ProductCategoryEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<ProductCategoryEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export interface ProductCategoryUpdateEntityEvent extends ProductCategoryEntityEvent {
    readonly previousEntity: ProductCategoryEntity;
}

export class ProductCategoryRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_PRODUCTCATEGORY",
        properties: [
            {
                name: "Id",
                column: "PRODUCTCATEGORY_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Name",
                column: "PRODUCTCATEGORY_NAME",
                type: "VARCHAR",
            },
            {
                name: "Path",
                column: "PRODUCTCATEGORY_PATH",
                type: "VARCHAR",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(ProductCategoryRepository.DEFINITION, undefined, dataSource);
    }

    public findAll(options: ProductCategoryEntityOptions = {}): ProductCategoryEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): ProductCategoryEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: ProductCategoryCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_PRODUCTCATEGORY",
            entity: entity,
            key: {
                name: "Id",
                column: "PRODUCTCATEGORY_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: ProductCategoryUpdateEntity): void {
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_PRODUCTCATEGORY",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "PRODUCTCATEGORY_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: ProductCategoryCreateEntity | ProductCategoryUpdateEntity): number {
        const id = (entity as ProductCategoryUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as ProductCategoryUpdateEntity);
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
            table: "CODBEX_PRODUCTCATEGORY",
            entity: entity,
            key: {
                name: "Id",
                column: "PRODUCTCATEGORY_ID",
                value: id
            }
        });
    }

    public count(options?: ProductCategoryEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX__PRODUCTCATEGORY"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: ProductCategoryEntityEvent | ProductCategoryUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-products-Settings-ProductCategory", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-products-Settings-ProductCategory").send(JSON.stringify(data));
    }
}
