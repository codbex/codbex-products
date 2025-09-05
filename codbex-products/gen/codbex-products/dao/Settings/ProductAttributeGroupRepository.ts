import { sql, query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface ProductAttributeGroupEntity {
    readonly Id: number;
    Name?: string;
}

export interface ProductAttributeGroupCreateEntity {
    readonly Name?: string;
}

export interface ProductAttributeGroupUpdateEntity extends ProductAttributeGroupCreateEntity {
    readonly Id: number;
}

export interface ProductAttributeGroupEntityOptions {
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
    $select?: (keyof ProductAttributeGroupEntity)[],
    $sort?: string | (keyof ProductAttributeGroupEntity)[],
    $order?: 'ASC' | 'DESC',
    $offset?: number,
    $limit?: number,
    $language?: string
}

export interface ProductAttributeGroupEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<ProductAttributeGroupEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export interface ProductAttributeGroupUpdateEntityEvent extends ProductAttributeGroupEntityEvent {
    readonly previousEntity: ProductAttributeGroupEntity;
}

export class ProductAttributeGroupRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_PRODUCTATTRIBUTEGROUP",
        properties: [
            {
                name: "Id",
                column: "PRODUCTATTRIBUTEGROUP_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Name",
                column: "PRODUCTATTRIBUTEGROUP_NAME",
                type: "VARCHAR",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(ProductAttributeGroupRepository.DEFINITION, undefined, dataSource);
    }

    public findAll(options: ProductAttributeGroupEntityOptions = {}): ProductAttributeGroupEntity[] {
        let list = this.dao.list(options);
        return list;
    }

    public findById(id: number, options: ProductAttributeGroupEntityOptions = {}): ProductAttributeGroupEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: ProductAttributeGroupCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_PRODUCTATTRIBUTEGROUP",
            entity: entity,
            key: {
                name: "Id",
                column: "PRODUCTATTRIBUTEGROUP_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: ProductAttributeGroupUpdateEntity): void {
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_PRODUCTATTRIBUTEGROUP",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "PRODUCTATTRIBUTEGROUP_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: ProductAttributeGroupCreateEntity | ProductAttributeGroupUpdateEntity): number {
        const id = (entity as ProductAttributeGroupUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as ProductAttributeGroupUpdateEntity);
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
            table: "CODBEX_PRODUCTATTRIBUTEGROUP",
            entity: entity,
            key: {
                name: "Id",
                column: "PRODUCTATTRIBUTEGROUP_ID",
                value: id
            }
        });
    }

    public count(options?: ProductAttributeGroupEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_PRODUCTATTRIBUTEGROUP"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: ProductAttributeGroupEntityEvent | ProductAttributeGroupUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-products-Settings-ProductAttributeGroup", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-products-Settings-ProductAttributeGroup").send(JSON.stringify(data));
    }
}
