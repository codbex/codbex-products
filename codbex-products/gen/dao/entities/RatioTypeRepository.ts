import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface RatioTypeEntity {
    readonly Id: number;
    Name?: string;
}

export interface RatioTypeCreateEntity {
    readonly Name?: string;
}

export interface RatioTypeUpdateEntity extends RatioTypeCreateEntity {
    readonly Id: number;
}

export interface RatioTypeEntityOptions {
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
    $select?: (keyof RatioTypeEntity)[],
    $sort?: string | (keyof RatioTypeEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface RatioTypeEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<RatioTypeEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface RatioTypeUpdateEntityEvent extends RatioTypeEntityEvent {
    readonly previousEntity: RatioTypeEntity;
}

export class RatioTypeRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_RATIOTYPE",
        properties: [
            {
                name: "Id",
                column: "RATIOTYPE_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Name",
                column: "RATIOTYPE_NAME",
                type: "VARCHAR",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(RatioTypeRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: RatioTypeEntityOptions): RatioTypeEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): RatioTypeEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: RatioTypeCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_RATIOTYPE",
            entity: entity,
            key: {
                name: "Id",
                column: "RATIOTYPE_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: RatioTypeUpdateEntity): void {
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_RATIOTYPE",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "RATIOTYPE_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: RatioTypeCreateEntity | RatioTypeUpdateEntity): number {
        const id = (entity as RatioTypeUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as RatioTypeUpdateEntity);
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
            table: "CODBEX_RATIOTYPE",
            entity: entity,
            key: {
                name: "Id",
                column: "RATIOTYPE_ID",
                value: id
            }
        });
    }

    public count(options?: RatioTypeEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_RATIOTYPE"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: RatioTypeEntityEvent | RatioTypeUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-products-entities-RatioType", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-products-entities-RatioType").send(JSON.stringify(data));
    }
}
