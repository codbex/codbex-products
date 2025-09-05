import { sql, query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface CampaignEntryEntity {
    readonly Id: number;
    Product?: number;
    Campaign?: number;
    Percent?: number;
    OldPrice?: number;
    NewPrice?: number;
    Gift?: string;
}

export interface CampaignEntryCreateEntity {
    readonly Product?: number;
    readonly Campaign?: number;
    readonly Percent?: number;
    readonly OldPrice?: number;
    readonly NewPrice?: number;
    readonly Gift?: string;
}

export interface CampaignEntryUpdateEntity extends CampaignEntryCreateEntity {
    readonly Id: number;
}

export interface CampaignEntryEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Product?: number | number[];
            Campaign?: number | number[];
            Percent?: number | number[];
            OldPrice?: number | number[];
            NewPrice?: number | number[];
            Gift?: string | string[];
        };
        notEquals?: {
            Id?: number | number[];
            Product?: number | number[];
            Campaign?: number | number[];
            Percent?: number | number[];
            OldPrice?: number | number[];
            NewPrice?: number | number[];
            Gift?: string | string[];
        };
        contains?: {
            Id?: number;
            Product?: number;
            Campaign?: number;
            Percent?: number;
            OldPrice?: number;
            NewPrice?: number;
            Gift?: string;
        };
        greaterThan?: {
            Id?: number;
            Product?: number;
            Campaign?: number;
            Percent?: number;
            OldPrice?: number;
            NewPrice?: number;
            Gift?: string;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Product?: number;
            Campaign?: number;
            Percent?: number;
            OldPrice?: number;
            NewPrice?: number;
            Gift?: string;
        };
        lessThan?: {
            Id?: number;
            Product?: number;
            Campaign?: number;
            Percent?: number;
            OldPrice?: number;
            NewPrice?: number;
            Gift?: string;
        };
        lessThanOrEqual?: {
            Id?: number;
            Product?: number;
            Campaign?: number;
            Percent?: number;
            OldPrice?: number;
            NewPrice?: number;
            Gift?: string;
        };
    },
    $select?: (keyof CampaignEntryEntity)[],
    $sort?: string | (keyof CampaignEntryEntity)[],
    $order?: 'ASC' | 'DESC',
    $offset?: number,
    $limit?: number,
    $language?: string
}

export interface CampaignEntryEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<CampaignEntryEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export interface CampaignEntryUpdateEntityEvent extends CampaignEntryEntityEvent {
    readonly previousEntity: CampaignEntryEntity;
}

export class CampaignEntryRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_CAMPAIGNENTRY",
        properties: [
            {
                name: "Id",
                column: "CAMPAIGNENTRY_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Product",
                column: "CAMPAIGNENTRY_PRODUCT",
                type: "INTEGER",
            },
            {
                name: "Campaign",
                column: "CAMPAIGNENTRY_CAMPAIGN",
                type: "INTEGER",
            },
            {
                name: "Percent",
                column: "CAMPAIGNENTRY_PERCENT",
                type: "INTEGER",
            },
            {
                name: "OldPrice",
                column: "CAMPAIGNENTRY_OLDPRICE",
                type: "DOUBLE",
            },
            {
                name: "NewPrice",
                column: "CAMPAIGNENTRY_NEWPRICE",
                type: "DOUBLE",
            },
            {
                name: "Gift",
                column: "CAMPAIGNENTRY_GIFT",
                type: "VARCHAR",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(CampaignEntryRepository.DEFINITION, undefined, dataSource);
    }

    public findAll(options: CampaignEntryEntityOptions = {}): CampaignEntryEntity[] {
        let list = this.dao.list(options);
        return list;
    }

    public findById(id: number, options: CampaignEntryEntityOptions = {}): CampaignEntryEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: CampaignEntryCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_CAMPAIGNENTRY",
            entity: entity,
            key: {
                name: "Id",
                column: "CAMPAIGNENTRY_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: CampaignEntryUpdateEntity): void {
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_CAMPAIGNENTRY",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "CAMPAIGNENTRY_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: CampaignEntryCreateEntity | CampaignEntryUpdateEntity): number {
        const id = (entity as CampaignEntryUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as CampaignEntryUpdateEntity);
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
            table: "CODBEX_CAMPAIGNENTRY",
            entity: entity,
            key: {
                name: "Id",
                column: "CAMPAIGNENTRY_ID",
                value: id
            }
        });
    }

    public count(options?: CampaignEntryEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_CAMPAIGNENTRY"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: CampaignEntryEntityEvent | CampaignEntryUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-products-Products-CampaignEntry", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-products-Products-CampaignEntry").send(JSON.stringify(data));
    }
}
