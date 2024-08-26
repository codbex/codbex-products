import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface SetTypeEntity {
    readonly Id: number;
    Name?: string;
}

export interface SetTypeCreateEntity {
    readonly Name?: string;
}

export interface SetTypeUpdateEntity extends SetTypeCreateEntity {
    readonly Id: number;
}

export interface SetTypeEntityOptions {
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
    $select?: (keyof SetTypeEntity)[],
    $sort?: string | (keyof SetTypeEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface SetTypeEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<SetTypeEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface SetTypeUpdateEntityEvent extends SetTypeEntityEvent {
    readonly previousEntity: SetTypeEntity;
}

export class SetTypeRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_SETTYPE",
        properties: [
            {
                name: "Id",
                column: "SETTYPE_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Name",
                column: "SETTYPE_NAME",
                type: "VARCHAR",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(SetTypeRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: SetTypeEntityOptions): SetTypeEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): SetTypeEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: SetTypeCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_SETTYPE",
            entity: entity,
            key: {
                name: "Id",
                column: "SETTYPE_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: SetTypeUpdateEntity): void {
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_SETTYPE",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "SETTYPE_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: SetTypeCreateEntity | SetTypeUpdateEntity): number {
        const id = (entity as SetTypeUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as SetTypeUpdateEntity);
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
            table: "CODBEX_SETTYPE",
            entity: entity,
            key: {
                name: "Id",
                column: "SETTYPE_ID",
                value: id
            }
        });
    }

    public count(options?: SetTypeEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_SETTYPE"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: SetTypeEntityEvent | SetTypeUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-products-Set-SetType", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-products-Set-SetType").send(JSON.stringify(data));
    }
}
