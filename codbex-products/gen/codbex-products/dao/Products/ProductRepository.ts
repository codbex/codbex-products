import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";
import { EntityUtils } from "../utils/EntityUtils";

export interface ProductEntity {
    readonly Id: number;
    Name: string;
    Title: string;
    Model: string;
    Batch: string;
    Type?: number;
    Category?: number;
    BaseUnit?: string;
    Company?: number;
    SKU?: string;
    UPC?: string;
    EAN?: string;
    JAN?: string;
    ISBN?: string;
    MPN?: string;
    Manufacturer?: number;
    VAT?: number;
    Weight?: number;
    Height?: number;
    Length?: number;
    Width?: number;
    IsStoredInBox?: boolean;
    BoxWeight?: number;
    BoxHeight?: number;
    BoxLength?: number;
    BoxWidth?: number;
    PiecesInBox?: number;
    Enabled?: boolean;
}

export interface ProductCreateEntity {
    readonly Title: string;
    readonly Model: string;
    readonly Batch: string;
    readonly Type?: number;
    readonly Category?: number;
    readonly BaseUnit?: string;
    readonly Company?: number;
    readonly SKU?: string;
    readonly UPC?: string;
    readonly EAN?: string;
    readonly JAN?: string;
    readonly ISBN?: string;
    readonly MPN?: string;
    readonly Manufacturer?: number;
    readonly VAT?: number;
    readonly Weight?: number;
    readonly Height?: number;
    readonly Length?: number;
    readonly Width?: number;
    readonly IsStoredInBox?: boolean;
    readonly BoxWeight?: number;
    readonly BoxHeight?: number;
    readonly BoxLength?: number;
    readonly BoxWidth?: number;
    readonly PiecesInBox?: number;
    readonly Enabled?: boolean;
}

export interface ProductUpdateEntity extends ProductCreateEntity {
    readonly Id: number;
}

export interface ProductEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Name?: string | string[];
            Title?: string | string[];
            Model?: string | string[];
            Batch?: string | string[];
            Type?: number | number[];
            Category?: number | number[];
            BaseUnit?: string | string[];
            Company?: number | number[];
            SKU?: string | string[];
            UPC?: string | string[];
            EAN?: string | string[];
            JAN?: string | string[];
            ISBN?: string | string[];
            MPN?: string | string[];
            Manufacturer?: number | number[];
            VAT?: number | number[];
            Weight?: number | number[];
            Height?: number | number[];
            Length?: number | number[];
            Width?: number | number[];
            IsStoredInBox?: boolean | boolean[];
            BoxWeight?: number | number[];
            BoxHeight?: number | number[];
            BoxLength?: number | number[];
            BoxWidth?: number | number[];
            PiecesInBox?: number | number[];
            Enabled?: boolean | boolean[];
        };
        notEquals?: {
            Id?: number | number[];
            Name?: string | string[];
            Title?: string | string[];
            Model?: string | string[];
            Batch?: string | string[];
            Type?: number | number[];
            Category?: number | number[];
            BaseUnit?: string | string[];
            Company?: number | number[];
            SKU?: string | string[];
            UPC?: string | string[];
            EAN?: string | string[];
            JAN?: string | string[];
            ISBN?: string | string[];
            MPN?: string | string[];
            Manufacturer?: number | number[];
            VAT?: number | number[];
            Weight?: number | number[];
            Height?: number | number[];
            Length?: number | number[];
            Width?: number | number[];
            IsStoredInBox?: boolean | boolean[];
            BoxWeight?: number | number[];
            BoxHeight?: number | number[];
            BoxLength?: number | number[];
            BoxWidth?: number | number[];
            PiecesInBox?: number | number[];
            Enabled?: boolean | boolean[];
        };
        contains?: {
            Id?: number;
            Name?: string;
            Title?: string;
            Model?: string;
            Batch?: string;
            Type?: number;
            Category?: number;
            BaseUnit?: string;
            Company?: number;
            SKU?: string;
            UPC?: string;
            EAN?: string;
            JAN?: string;
            ISBN?: string;
            MPN?: string;
            Manufacturer?: number;
            VAT?: number;
            Weight?: number;
            Height?: number;
            Length?: number;
            Width?: number;
            IsStoredInBox?: boolean;
            BoxWeight?: number;
            BoxHeight?: number;
            BoxLength?: number;
            BoxWidth?: number;
            PiecesInBox?: number;
            Enabled?: boolean;
        };
        greaterThan?: {
            Id?: number;
            Name?: string;
            Title?: string;
            Model?: string;
            Batch?: string;
            Type?: number;
            Category?: number;
            BaseUnit?: string;
            Company?: number;
            SKU?: string;
            UPC?: string;
            EAN?: string;
            JAN?: string;
            ISBN?: string;
            MPN?: string;
            Manufacturer?: number;
            VAT?: number;
            Weight?: number;
            Height?: number;
            Length?: number;
            Width?: number;
            IsStoredInBox?: boolean;
            BoxWeight?: number;
            BoxHeight?: number;
            BoxLength?: number;
            BoxWidth?: number;
            PiecesInBox?: number;
            Enabled?: boolean;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Name?: string;
            Title?: string;
            Model?: string;
            Batch?: string;
            Type?: number;
            Category?: number;
            BaseUnit?: string;
            Company?: number;
            SKU?: string;
            UPC?: string;
            EAN?: string;
            JAN?: string;
            ISBN?: string;
            MPN?: string;
            Manufacturer?: number;
            VAT?: number;
            Weight?: number;
            Height?: number;
            Length?: number;
            Width?: number;
            IsStoredInBox?: boolean;
            BoxWeight?: number;
            BoxHeight?: number;
            BoxLength?: number;
            BoxWidth?: number;
            PiecesInBox?: number;
            Enabled?: boolean;
        };
        lessThan?: {
            Id?: number;
            Name?: string;
            Title?: string;
            Model?: string;
            Batch?: string;
            Type?: number;
            Category?: number;
            BaseUnit?: string;
            Company?: number;
            SKU?: string;
            UPC?: string;
            EAN?: string;
            JAN?: string;
            ISBN?: string;
            MPN?: string;
            Manufacturer?: number;
            VAT?: number;
            Weight?: number;
            Height?: number;
            Length?: number;
            Width?: number;
            IsStoredInBox?: boolean;
            BoxWeight?: number;
            BoxHeight?: number;
            BoxLength?: number;
            BoxWidth?: number;
            PiecesInBox?: number;
            Enabled?: boolean;
        };
        lessThanOrEqual?: {
            Id?: number;
            Name?: string;
            Title?: string;
            Model?: string;
            Batch?: string;
            Type?: number;
            Category?: number;
            BaseUnit?: string;
            Company?: number;
            SKU?: string;
            UPC?: string;
            EAN?: string;
            JAN?: string;
            ISBN?: string;
            MPN?: string;
            Manufacturer?: number;
            VAT?: number;
            Weight?: number;
            Height?: number;
            Length?: number;
            Width?: number;
            IsStoredInBox?: boolean;
            BoxWeight?: number;
            BoxHeight?: number;
            BoxLength?: number;
            BoxWidth?: number;
            PiecesInBox?: number;
            Enabled?: boolean;
        };
    },
    $select?: (keyof ProductEntity)[],
    $sort?: string | (keyof ProductEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface ProductEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<ProductEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface ProductUpdateEntityEvent extends ProductEntityEvent {
    readonly previousEntity: ProductEntity;
}

export class ProductRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_PRODUCT",
        properties: [
            {
                name: "Id",
                column: "PRODUCT_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Name",
                column: "PRODUCT_NAME",
                type: "VARCHAR",
                required: true
            },
            {
                name: "Title",
                column: "PRODUCT_TITLE",
                type: "VARCHAR",
                required: true
            },
            {
                name: "Model",
                column: "PRODUCT_MODEL",
                type: "VARCHAR",
                required: true
            },
            {
                name: "Batch",
                column: "PRODUCT_BATCH",
                type: "VARCHAR",
                required: true
            },
            {
                name: "Type",
                column: "PRODUCT_TYPE",
                type: "INTEGER",
            },
            {
                name: "Category",
                column: "PRODUCT_CATEGORY",
                type: "INTEGER",
            },
            {
                name: "BaseUnit",
                column: "PRODUCT_BASEUNIT",
                type: "VARCHAR",
            },
            {
                name: "Company",
                column: "PRODUCT_COMPANY",
                type: "INTEGER",
            },
            {
                name: "SKU",
                column: "PRODUCT_SKU",
                type: "VARCHAR",
            },
            {
                name: "UPC",
                column: "PRODUCT_UPC",
                type: "VARCHAR",
            },
            {
                name: "EAN",
                column: "PRODUCT_EAN",
                type: "VARCHAR",
            },
            {
                name: "JAN",
                column: "PRODUCT_JAN",
                type: "VARCHAR",
            },
            {
                name: "ISBN",
                column: "PRODUCT_ISBN",
                type: "VARCHAR",
            },
            {
                name: "MPN",
                column: "PRODUCT_MPN",
                type: "VARCHAR",
            },
            {
                name: "Manufacturer",
                column: "PRODUCT_MANUFACTURER",
                type: "INTEGER",
            },
            {
                name: "VAT",
                column: "PRODUCT_VAT",
                type: "DECIMAL",
            },
            {
                name: "Weight",
                column: "PRODUCT_WEIGHT",
                type: "DOUBLE",
            },
            {
                name: "Height",
                column: "PRODUCT_HEIGHT",
                type: "DOUBLE",
            },
            {
                name: "Length",
                column: "PRODUCT_LENGTH",
                type: "DOUBLE",
            },
            {
                name: "Width",
                column: "PRODUCT_WIDTH",
                type: "DOUBLE",
            },
            {
                name: "IsStoredInBox",
                column: "PRODUCT_ISSTOREDINBOX",
                type: "BOOLEAN",
            },
            {
                name: "BoxWeight",
                column: "PRODUCT_BOXWEIGHT",
                type: "DOUBLE",
            },
            {
                name: "BoxHeight",
                column: "PRODUCT_BOXHEIGHT",
                type: "DOUBLE",
            },
            {
                name: "BoxLength",
                column: "PRODUCT_BOXLENGTH",
                type: "DOUBLE",
            },
            {
                name: "BoxWidth",
                column: "PRODUCT_BOXWIDTH",
                type: "DOUBLE",
            },
            {
                name: "PiecesInBox",
                column: "PRODUCT_PIECESINBOX",
                type: "INTEGER",
            },
            {
                name: "Enabled",
                column: "PRODUCT_ENABLED",
                type: "BOOLEAN",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(ProductRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: ProductEntityOptions): ProductEntity[] {
        return this.dao.list(options).map((e: ProductEntity) => {
            EntityUtils.setBoolean(e, "IsStoredInBox");
            EntityUtils.setBoolean(e, "Enabled");
            return e;
        });
    }

    public findById(id: number): ProductEntity | undefined {
        const entity = this.dao.find(id);
        EntityUtils.setBoolean(entity, "IsStoredInBox");
        EntityUtils.setBoolean(entity, "Enabled");
        return entity ?? undefined;
    }

    public create(entity: ProductCreateEntity): number {
        EntityUtils.setBoolean(entity, "IsStoredInBox");
        EntityUtils.setBoolean(entity, "Enabled");
        // @ts-ignore
        (entity as ProductEntity).Name = (entity["Title"] + "/" + entity["Model"] + "/" + entity["Batch"] + "-" + (entity["Enabled"] ? 'enabled' : 'disabled'));;
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_PRODUCT",
            entity: entity,
            key: {
                name: "Id",
                column: "PRODUCT_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: ProductUpdateEntity): void {
        EntityUtils.setBoolean(entity, "IsStoredInBox");
        EntityUtils.setBoolean(entity, "Enabled");
        // @ts-ignore
        (entity as ProductEntity).Name = (entity["Title"] + "/" + entity["Model"] + "/" + entity["Batch"] + "-" + (entity["Enabled"] ? 'enabled' : 'disabled'));;
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_PRODUCT",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "PRODUCT_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: ProductCreateEntity | ProductUpdateEntity): number {
        const id = (entity as ProductUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as ProductUpdateEntity);
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
            table: "CODBEX_PRODUCT",
            entity: entity,
            key: {
                name: "Id",
                column: "PRODUCT_ID",
                value: id
            }
        });
    }

    public count(options?: ProductEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX__PRODUCT"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: ProductEntityEvent | ProductUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-products-Products-Product", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-products-Products-Product").send(JSON.stringify(data));
    }
}
