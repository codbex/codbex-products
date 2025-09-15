import { sql, query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface ProductDocumentEntity {
    readonly Id: number;
    Product?: number;
    Link?: string;
}

export interface ProductDocumentCreateEntity {
    readonly Product?: number;
    readonly Link?: string;
}

export interface ProductDocumentUpdateEntity extends ProductDocumentCreateEntity {
    readonly Id: number;
}

export interface ProductDocumentEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Product?: number | number[];
            Link?: string | string[];
        };
        notEquals?: {
            Id?: number | number[];
            Product?: number | number[];
            Link?: string | string[];
        };
        contains?: {
            Id?: number;
            Product?: number;
            Link?: string;
        };
        greaterThan?: {
            Id?: number;
            Product?: number;
            Link?: string;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Product?: number;
            Link?: string;
        };
        lessThan?: {
            Id?: number;
            Product?: number;
            Link?: string;
        };
        lessThanOrEqual?: {
            Id?: number;
            Product?: number;
            Link?: string;
        };
    },
    $select?: (keyof ProductDocumentEntity)[],
    $sort?: string | (keyof ProductDocumentEntity)[],
    $order?: 'ASC' | 'DESC',
    $offset?: number,
    $limit?: number,
    $language?: string
}

export interface ProductDocumentEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<ProductDocumentEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export interface ProductDocumentUpdateEntityEvent extends ProductDocumentEntityEvent {
    readonly previousEntity: ProductDocumentEntity;
}

export class ProductDocumentRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_PRODUCTDOCUMENT",
        properties: [
            {
                name: "Id",
                column: "PRODUCTDOCUMENT_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Product",
                column: "PRODUCTDOCUMENT_PRODUCT",
                type: "INTEGER",
            },
            {
                name: "Link",
                column: "PRODUCTDOCUMENT_LINK",
                type: "VARCHAR",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(ProductDocumentRepository.DEFINITION, undefined, dataSource);
    }

    public findAll(options: ProductDocumentEntityOptions = {}): ProductDocumentEntity[] {
        let list = this.dao.list(options);
        return list;
    }

    public findById(id: number, options: ProductDocumentEntityOptions = {}): ProductDocumentEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: ProductDocumentCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_PRODUCTDOCUMENT",
            entity: entity,
            key: {
                name: "Id",
                column: "PRODUCTDOCUMENT_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: ProductDocumentUpdateEntity): void {
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_PRODUCTDOCUMENT",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "PRODUCTDOCUMENT_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: ProductDocumentCreateEntity | ProductDocumentUpdateEntity): number {
        const id = (entity as ProductDocumentUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as ProductDocumentUpdateEntity);
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
            table: "CODBEX_PRODUCTDOCUMENT",
            entity: entity,
            key: {
                name: "Id",
                column: "PRODUCTDOCUMENT_ID",
                value: id
            }
        });
    }

    public count(options?: ProductDocumentEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_PRODUCTDOCUMENT"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: ProductDocumentEntityEvent | ProductDocumentUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-products-Products-ProductDocument", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-products-Products-ProductDocument").send(JSON.stringify(data));
    }
}
