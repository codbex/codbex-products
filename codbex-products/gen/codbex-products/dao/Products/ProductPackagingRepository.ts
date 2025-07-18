import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface ProductPackagingEntity {
    readonly Id: number;
    Product?: number;
    Weight?: number;
    Height?: number;
    Length?: number;
    Width?: number;
    Ratio?: number;
    Name?: string;
}

export interface ProductPackagingCreateEntity {
    readonly Product?: number;
    readonly Weight?: number;
    readonly Height?: number;
    readonly Length?: number;
    readonly Width?: number;
    readonly Ratio?: number;
    readonly Name?: string;
}

export interface ProductPackagingUpdateEntity extends ProductPackagingCreateEntity {
    readonly Id: number;
}

export interface ProductPackagingEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Product?: number | number[];
            Weight?: number | number[];
            Height?: number | number[];
            Length?: number | number[];
            Width?: number | number[];
            Ratio?: number | number[];
            Name?: string | string[];
        };
        notEquals?: {
            Id?: number | number[];
            Product?: number | number[];
            Weight?: number | number[];
            Height?: number | number[];
            Length?: number | number[];
            Width?: number | number[];
            Ratio?: number | number[];
            Name?: string | string[];
        };
        contains?: {
            Id?: number;
            Product?: number;
            Weight?: number;
            Height?: number;
            Length?: number;
            Width?: number;
            Ratio?: number;
            Name?: string;
        };
        greaterThan?: {
            Id?: number;
            Product?: number;
            Weight?: number;
            Height?: number;
            Length?: number;
            Width?: number;
            Ratio?: number;
            Name?: string;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Product?: number;
            Weight?: number;
            Height?: number;
            Length?: number;
            Width?: number;
            Ratio?: number;
            Name?: string;
        };
        lessThan?: {
            Id?: number;
            Product?: number;
            Weight?: number;
            Height?: number;
            Length?: number;
            Width?: number;
            Ratio?: number;
            Name?: string;
        };
        lessThanOrEqual?: {
            Id?: number;
            Product?: number;
            Weight?: number;
            Height?: number;
            Length?: number;
            Width?: number;
            Ratio?: number;
            Name?: string;
        };
    },
    $select?: (keyof ProductPackagingEntity)[],
    $sort?: string | (keyof ProductPackagingEntity)[],
    $order?: 'ASC' | 'DESC',
    $offset?: number,
    $limit?: number,
}

interface ProductPackagingEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<ProductPackagingEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface ProductPackagingUpdateEntityEvent extends ProductPackagingEntityEvent {
    readonly previousEntity: ProductPackagingEntity;
}

export class ProductPackagingRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_PRODUCTPACKAGING",
        properties: [
            {
                name: "Id",
                column: "PRODUCTSET_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Product",
                column: "PRODUCTSET_PRODUCT",
                type: "INTEGER",
            },
            {
                name: "Weight",
                column: "PRODUCTSET_WEIGHT",
                type: "DECIMAL",
            },
            {
                name: "Height",
                column: "PRODUCTSET_HEIGHT",
                type: "DECIMAL",
            },
            {
                name: "Length",
                column: "PRODUCTSET_LENGTH",
                type: "DECIMAL",
            },
            {
                name: "Width",
                column: "PRODUCTSET_WIDTH",
                type: "DECIMAL",
            },
            {
                name: "Ratio",
                column: "PRODUCTSET_RATIO",
                type: "DECIMAL",
            },
            {
                name: "Name",
                column: "PRODUCTSET_NAME",
                type: "VARCHAR",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(ProductPackagingRepository.DEFINITION, undefined, dataSource);
    }

    public findAll(options: ProductPackagingEntityOptions = {}): ProductPackagingEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): ProductPackagingEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: ProductPackagingCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_PRODUCTPACKAGING",
            entity: entity,
            key: {
                name: "Id",
                column: "PRODUCTSET_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: ProductPackagingUpdateEntity): void {
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_PRODUCTPACKAGING",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "PRODUCTSET_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: ProductPackagingCreateEntity | ProductPackagingUpdateEntity): number {
        const id = (entity as ProductPackagingUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as ProductPackagingUpdateEntity);
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
            table: "CODBEX_PRODUCTPACKAGING",
            entity: entity,
            key: {
                name: "Id",
                column: "PRODUCTSET_ID",
                value: id
            }
        });
    }

    public count(options?: ProductPackagingEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_PRODUCTPACKAGING"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: ProductPackagingEntityEvent | ProductPackagingUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-products-Products-ProductPackaging", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-products-Products-ProductPackaging").send(JSON.stringify(data));
    }
}
