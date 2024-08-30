import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface ProductSetEntity {
    readonly Id: number;
    UoM?: number;
    Product?: number;
    Weight: number;
    Height: number;
    Length: number;
    Width: number;
    Ratio?: number;
}

export interface ProductSetCreateEntity {
    readonly UoM?: number;
    readonly Product?: number;
    readonly Weight: number;
    readonly Height: number;
    readonly Length: number;
    readonly Width: number;
    readonly Ratio?: number;
}

export interface ProductSetUpdateEntity extends ProductSetCreateEntity {
    readonly Id: number;
}

export interface ProductSetEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            UoM?: number | number[];
            Product?: number | number[];
            Weight?: number | number[];
            Height?: number | number[];
            Length?: number | number[];
            Width?: number | number[];
            Ratio?: number | number[];
        };
        notEquals?: {
            Id?: number | number[];
            UoM?: number | number[];
            Product?: number | number[];
            Weight?: number | number[];
            Height?: number | number[];
            Length?: number | number[];
            Width?: number | number[];
            Ratio?: number | number[];
        };
        contains?: {
            Id?: number;
            UoM?: number;
            Product?: number;
            Weight?: number;
            Height?: number;
            Length?: number;
            Width?: number;
            Ratio?: number;
        };
        greaterThan?: {
            Id?: number;
            UoM?: number;
            Product?: number;
            Weight?: number;
            Height?: number;
            Length?: number;
            Width?: number;
            Ratio?: number;
        };
        greaterThanOrEqual?: {
            Id?: number;
            UoM?: number;
            Product?: number;
            Weight?: number;
            Height?: number;
            Length?: number;
            Width?: number;
            Ratio?: number;
        };
        lessThan?: {
            Id?: number;
            UoM?: number;
            Product?: number;
            Weight?: number;
            Height?: number;
            Length?: number;
            Width?: number;
            Ratio?: number;
        };
        lessThanOrEqual?: {
            Id?: number;
            UoM?: number;
            Product?: number;
            Weight?: number;
            Height?: number;
            Length?: number;
            Width?: number;
            Ratio?: number;
        };
    },
    $select?: (keyof ProductSetEntity)[],
    $sort?: string | (keyof ProductSetEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface ProductSetEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<ProductSetEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface ProductSetUpdateEntityEvent extends ProductSetEntityEvent {
    readonly previousEntity: ProductSetEntity;
}

export class ProductSetRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_PRODUCTSET",
        properties: [
            {
                name: "Id",
                column: "PRODUCTSET_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "UoM",
                column: "PRODUCTSET_UOM",
                type: "INTEGER",
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
                required: true
            },
            {
                name: "Height",
                column: "PRODUCTSET_HEIGHT",
                type: "DECIMAL",
                required: true
            },
            {
                name: "Length",
                column: "PRODUCTSET_LENGTH",
                type: "DECIMAL",
                required: true
            },
            {
                name: "Width",
                column: "PRODUCTSET_WIDTH",
                type: "DECIMAL",
                required: true
            },
            {
                name: "Ratio",
                column: "PRODUCTSET_RATIO",
                type: "DECIMAL",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(ProductSetRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: ProductSetEntityOptions): ProductSetEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): ProductSetEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: ProductSetCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_PRODUCTSET",
            entity: entity,
            key: {
                name: "Id",
                column: "PRODUCTSET_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: ProductSetUpdateEntity): void {
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_PRODUCTSET",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "PRODUCTSET_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: ProductSetCreateEntity | ProductSetUpdateEntity): number {
        const id = (entity as ProductSetUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as ProductSetUpdateEntity);
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
            table: "CODBEX_PRODUCTSET",
            entity: entity,
            key: {
                name: "Id",
                column: "PRODUCTSET_ID",
                value: id
            }
        });
    }

    public count(options?: ProductSetEntityOptions): number {
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

    private async triggerEvent(data: ProductSetEntityEvent | ProductSetUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-products-Products-ProductSet", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-products-Products-ProductSet").send(JSON.stringify(data));
    }
}
