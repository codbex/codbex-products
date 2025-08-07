import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";
import { EntityUtils } from "../utils/EntityUtils";

export interface CampaignEntity {
    readonly Id: number;
    Name?: string;
    StartDate?: Date;
    EndDate?: Date;
}

export interface CampaignCreateEntity {
    readonly Name?: string;
    readonly StartDate?: Date;
    readonly EndDate?: Date;
}

export interface CampaignUpdateEntity extends CampaignCreateEntity {
    readonly Id: number;
}

export interface CampaignEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Name?: string | string[];
            StartDate?: Date | Date[];
            EndDate?: Date | Date[];
        };
        notEquals?: {
            Id?: number | number[];
            Name?: string | string[];
            StartDate?: Date | Date[];
            EndDate?: Date | Date[];
        };
        contains?: {
            Id?: number;
            Name?: string;
            StartDate?: Date;
            EndDate?: Date;
        };
        greaterThan?: {
            Id?: number;
            Name?: string;
            StartDate?: Date;
            EndDate?: Date;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Name?: string;
            StartDate?: Date;
            EndDate?: Date;
        };
        lessThan?: {
            Id?: number;
            Name?: string;
            StartDate?: Date;
            EndDate?: Date;
        };
        lessThanOrEqual?: {
            Id?: number;
            Name?: string;
            StartDate?: Date;
            EndDate?: Date;
        };
    },
    $select?: (keyof CampaignEntity)[],
    $sort?: string | (keyof CampaignEntity)[],
    $order?: 'ASC' | 'DESC',
    $offset?: number,
    $limit?: number,
}

export interface CampaignEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<CampaignEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export interface CampaignUpdateEntityEvent extends CampaignEntityEvent {
    readonly previousEntity: CampaignEntity;
}

export class CampaignRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_CAMPAIGN",
        properties: [
            {
                name: "Id",
                column: "CAMPAIGN_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Name",
                column: "CAMPAIGN_NAME",
                type: "VARCHAR",
            },
            {
                name: "StartDate",
                column: "CAMPAIGN_STARTDATE",
                type: "DATE",
            },
            {
                name: "EndDate",
                column: "CAMPAIGN_ENDDATE",
                type: "DATE",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(CampaignRepository.DEFINITION, undefined, dataSource);
    }

    public findAll(options: CampaignEntityOptions = {}): CampaignEntity[] {
        return this.dao.list(options).map((e: CampaignEntity) => {
            EntityUtils.setDate(e, "StartDate");
            EntityUtils.setDate(e, "EndDate");
            return e;
        });
    }

    public findById(id: number): CampaignEntity | undefined {
        const entity = this.dao.find(id);
        EntityUtils.setDate(entity, "StartDate");
        EntityUtils.setDate(entity, "EndDate");
        return entity ?? undefined;
    }

    public create(entity: CampaignCreateEntity): number {
        EntityUtils.setLocalDate(entity, "StartDate");
        EntityUtils.setLocalDate(entity, "EndDate");
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_CAMPAIGN",
            entity: entity,
            key: {
                name: "Id",
                column: "CAMPAIGN_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: CampaignUpdateEntity): void {
        // EntityUtils.setLocalDate(entity, "StartDate");
        // EntityUtils.setLocalDate(entity, "EndDate");
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_CAMPAIGN",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "CAMPAIGN_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: CampaignCreateEntity | CampaignUpdateEntity): number {
        const id = (entity as CampaignUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as CampaignUpdateEntity);
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
            table: "CODBEX_CAMPAIGN",
            entity: entity,
            key: {
                name: "Id",
                column: "CAMPAIGN_ID",
                value: id
            }
        });
    }

    public count(options?: CampaignEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_CAMPAIGN"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: CampaignEntityEvent | CampaignUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-products-Campaign-Campaign", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-products-Campaign-Campaign").send(JSON.stringify(data));
    }
}
