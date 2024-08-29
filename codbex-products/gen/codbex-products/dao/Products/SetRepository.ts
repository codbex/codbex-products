import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface SetEntity {
    readonly Id: number;
    SetType?: number;
    Quantity?: string;
    Weight: number;
    Height: number;
    Length: number;
    Width: number;
    Product?: number;
    Ratio?: number;
}

export interface SetCreateEntity {
    readonly SetType?: number;
    readonly Quantity?: string;
    readonly Weight: number;
    readonly Height: number;
    readonly Length: number;
    readonly Width: number;
    readonly Product?: number;
    readonly Ratio?: number;
}

export interface SetUpdateEntity extends SetCreateEntity {
    readonly Id: number;
}

export interface SetEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            SetType?: number | number[];
            Quantity?: string | string[];
            Weight?: number | number[];
            Height?: number | number[];
            Length?: number | number[];
            Width?: number | number[];
            Product?: number | number[];
            Ratio?: number | number[];
        };
        notEquals?: {
            Id?: number | number[];
            SetType?: number | number[];
            Quantity?: string | string[];
            Weight?: number | number[];
            Height?: number | number[];
            Length?: number | number[];
            Width?: number | number[];
            Product?: number | number[];
            Ratio?: number | number[];
        };
        contains?: {
            Id?: number;
            SetType?: number;
            Quantity?: string;
            Weight?: number;
            Height?: number;
            Length?: number;
            Width?: number;
            Product?: number;
            Ratio?: number;
        };
        greaterThan?: {
            Id?: number;
            SetType?: number;
            Quantity?: string;
            Weight?: number;
            Height?: number;
            Length?: number;
            Width?: number;
            Product?: number;
            Ratio?: number;
        };
        greaterThanOrEqual?: {
            Id?: number;
            SetType?: number;
            Quantity?: string;
            Weight?: number;
            Height?: number;
            Length?: number;
            Width?: number;
            Product?: number;
            Ratio?: number;
        };
        lessThan?: {
            Id?: number;
            SetType?: number;
            Quantity?: string;
            Weight?: number;
            Height?: number;
            Length?: number;
            Width?: number;
            Product?: number;
            Ratio?: number;
        };
        lessThanOrEqual?: {
            Id?: number;
            SetType?: number;
            Quantity?: string;
            Weight?: number;
            Height?: number;
            Length?: number;
            Width?: number;
            Product?: number;
            Ratio?: number;
        };
    },
    $select?: (keyof SetEntity)[],
    $sort?: string | (keyof SetEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface SetEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<SetEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface SetUpdateEntityEvent extends SetEntityEvent {
    readonly previousEntity: SetEntity;
}

export class SetRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_SET",
        properties: [
            {
                name: "Id",
                column: "SET_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "SetType",
                column: "SET_SETTYPE",
                type: "INTEGER",
            },
            {
                name: "Quantity",
                column: "SET_QUANTITY",
                type: "VARCHAR",
            },
            {
                name: "Weight",
                column: "SET_WEIGHT",
                type: "DECIMAL",
                required: true
            },
            {
                name: "Height",
                column: "SET_HEIGHT",
                type: "DECIMAL",
                required: true
            },
            {
                name: "Length",
                column: "SET_LENGTH",
                type: "DECIMAL",
                required: true
            },
            {
                name: "Width",
                column: "SET_WIDTH",
                type: "DECIMAL",
                required: true
            },
            {
                name: "Product",
                column: "SET_PRODUCT",
                type: "INTEGER",
            },
            {
                name: "Ratio",
                column: "SET_RATIO",
                type: "INTEGER",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(SetRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: SetEntityOptions): SetEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): SetEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: SetCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_SET",
            entity: entity,
            key: {
                name: "Id",
                column: "SET_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: SetUpdateEntity): void {
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_SET",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "SET_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: SetCreateEntity | SetUpdateEntity): number {
        const id = (entity as SetUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as SetUpdateEntity);
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
            table: "CODBEX_SET",
            entity: entity,
            key: {
                name: "Id",
                column: "SET_ID",
                value: id
            }
        });
    }

    public count(options?: SetEntityOptions): number {
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

    private async triggerEvent(data: SetEntityEvent | SetUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-products-Products-Set", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-products-Products-Set").send(JSON.stringify(data));
    }
}
