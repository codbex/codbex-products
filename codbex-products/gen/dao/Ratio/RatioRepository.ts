import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface RatioEntity {
    readonly Id: number;
    RatioType?: number;
    Amount?: number;
}

export interface RatioCreateEntity {
    readonly RatioType?: number;
    readonly Amount?: number;
}

export interface RatioUpdateEntity extends RatioCreateEntity {
    readonly Id: number;
}

export interface RatioEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            RatioType?: number | number[];
            Amount?: number | number[];
        };
        notEquals?: {
            Id?: number | number[];
            RatioType?: number | number[];
            Amount?: number | number[];
        };
        contains?: {
            Id?: number;
            RatioType?: number;
            Amount?: number;
        };
        greaterThan?: {
            Id?: number;
            RatioType?: number;
            Amount?: number;
        };
        greaterThanOrEqual?: {
            Id?: number;
            RatioType?: number;
            Amount?: number;
        };
        lessThan?: {
            Id?: number;
            RatioType?: number;
            Amount?: number;
        };
        lessThanOrEqual?: {
            Id?: number;
            RatioType?: number;
            Amount?: number;
        };
    },
    $select?: (keyof RatioEntity)[],
    $sort?: string | (keyof RatioEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface RatioEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<RatioEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface RatioUpdateEntityEvent extends RatioEntityEvent {
    readonly previousEntity: RatioEntity;
}

export class RatioRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_RATIO",
        properties: [
            {
                name: "Id",
                column: "RATIO_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "RatioType",
                column: "RATIO_RATIOTYPE",
                type: "INTEGER",
            },
            {
                name: "Amount",
                column: "RATIO_AMOUNT",
                type: "DECIMAL",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(RatioRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: RatioEntityOptions): RatioEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): RatioEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: RatioCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_RATIO",
            entity: entity,
            key: {
                name: "Id",
                column: "RATIO_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: RatioUpdateEntity): void {
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_RATIO",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "RATIO_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: RatioCreateEntity | RatioUpdateEntity): number {
        const id = (entity as RatioUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as RatioUpdateEntity);
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
            table: "CODBEX_RATIO",
            entity: entity,
            key: {
                name: "Id",
                column: "RATIO_ID",
                value: id
            }
        });
    }

    public count(options?: RatioEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_RATIO"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: RatioEntityEvent | RatioUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-products-Ratio-Ratio", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-products-Ratio-Ratio").send(JSON.stringify(data));
    }
}
