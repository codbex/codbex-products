import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";
import { EntityUtils } from "../utils/EntityUtils";

export interface ProductImageEntity {
    readonly Id: number;
    ImageLink?: string;
    Product?: number;
    IsFeature?: boolean;
}

export interface ProductImageCreateEntity {
    readonly ImageLink?: string;
    readonly Product?: number;
    readonly IsFeature?: boolean;
}

export interface ProductImageUpdateEntity extends ProductImageCreateEntity {
    readonly Id: number;
}

export interface ProductImageEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            ImageLink?: string | string[];
            Product?: number | number[];
            IsFeature?: boolean | boolean[];
        };
        notEquals?: {
            Id?: number | number[];
            ImageLink?: string | string[];
            Product?: number | number[];
            IsFeature?: boolean | boolean[];
        };
        contains?: {
            Id?: number;
            ImageLink?: string;
            Product?: number;
            IsFeature?: boolean;
        };
        greaterThan?: {
            Id?: number;
            ImageLink?: string;
            Product?: number;
            IsFeature?: boolean;
        };
        greaterThanOrEqual?: {
            Id?: number;
            ImageLink?: string;
            Product?: number;
            IsFeature?: boolean;
        };
        lessThan?: {
            Id?: number;
            ImageLink?: string;
            Product?: number;
            IsFeature?: boolean;
        };
        lessThanOrEqual?: {
            Id?: number;
            ImageLink?: string;
            Product?: number;
            IsFeature?: boolean;
        };
    },
    $select?: (keyof ProductImageEntity)[],
    $sort?: string | (keyof ProductImageEntity)[],
    $order?: 'ASC' | 'DESC',
    $offset?: number,
    $limit?: number,
}

export interface ProductImageEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<ProductImageEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export interface ProductImageUpdateEntityEvent extends ProductImageEntityEvent {
    readonly previousEntity: ProductImageEntity;
}

export class ProductImageRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_PRODUCTIMAGE",
        properties: [
            {
                name: "Id",
                column: "PRODUCTIMAGE_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "ImageLink",
                column: "PRODUCTIMAGE_IMAGELINK",
                type: "VARCHAR",
            },
            {
                name: "Product",
                column: "PRODUCTIMAGE_PRODUCT",
                type: "INTEGER",
            },
            {
                name: "IsFeature",
                column: "PRODUCTIMAGE_ISFEATURE",
                type: "BOOLEAN",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(ProductImageRepository.DEFINITION, undefined, dataSource);
    }

    public findAll(options: ProductImageEntityOptions = {}): ProductImageEntity[] {
        return this.dao.list(options).map((e: ProductImageEntity) => {
            EntityUtils.setBoolean(e, "IsFeature");
            return e;
        });
    }

    public findById(id: number): ProductImageEntity | undefined {
        const entity = this.dao.find(id);
        EntityUtils.setBoolean(entity, "IsFeature");
        return entity ?? undefined;
    }

    public create(entity: ProductImageCreateEntity): number {
        EntityUtils.setBoolean(entity, "IsFeature");
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_PRODUCTIMAGE",
            entity: entity,
            key: {
                name: "Id",
                column: "PRODUCTIMAGE_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: ProductImageUpdateEntity): void {
        EntityUtils.setBoolean(entity, "IsFeature");
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_PRODUCTIMAGE",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "PRODUCTIMAGE_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: ProductImageCreateEntity | ProductImageUpdateEntity): number {
        const id = (entity as ProductImageUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as ProductImageUpdateEntity);
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
            table: "CODBEX_PRODUCTIMAGE",
            entity: entity,
            key: {
                name: "Id",
                column: "PRODUCTIMAGE_ID",
                value: id
            }
        });
    }

    public count(options?: ProductImageEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_PRODUCTIMAGE"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: ProductImageEntityEvent | ProductImageUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-products-Products-ProductImage", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-products-Products-ProductImage").send(JSON.stringify(data));
    }
}
