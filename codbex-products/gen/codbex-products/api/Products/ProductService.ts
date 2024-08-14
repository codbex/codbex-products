import { Controller, Get, Post, Put, Delete, response } from "sdk/http"
import { Extensions } from "sdk/extensions"
import { ProductRepository, ProductEntityOptions } from "../../dao/Products/ProductRepository";
import { ValidationError } from "../utils/ValidationError";
import { HttpUtils } from "../utils/HttpUtils";

const validationModules = await Extensions.loadExtensionModules("codbex-products-Products-Product", ["validate"]);

@Controller
class ProductService {

    private readonly repository = new ProductRepository();

    @Get("/")
    public getAll(_: any, ctx: any) {
        try {
            const options: ProductEntityOptions = {
                $limit: ctx.queryParameters["$limit"] ? parseInt(ctx.queryParameters["$limit"]) : undefined,
                $offset: ctx.queryParameters["$offset"] ? parseInt(ctx.queryParameters["$offset"]) : undefined
            };

            return this.repository.findAll(options);
        } catch (error: any) {
            this.handleError(error);
        }
    }

    @Post("/")
    public create(entity: any) {
        try {
            this.validateEntity(entity);
            entity.Id = this.repository.create(entity);
            response.setHeader("Content-Location", "/services/ts/codbex-products/gen/codbex-products/api/Products/ProductService.ts/" + entity.Id);
            response.setStatus(response.CREATED);
            return entity;
        } catch (error: any) {
            this.handleError(error);
        }
    }

    @Get("/count")
    public count() {
        try {
            return this.repository.count();
        } catch (error: any) {
            this.handleError(error);
        }
    }

    @Post("/count")
    public countWithFilter(filter: any) {
        try {
            return this.repository.count(filter);
        } catch (error: any) {
            this.handleError(error);
        }
    }

    @Post("/search")
    public search(filter: any) {
        try {
            return this.repository.findAll(filter);
        } catch (error: any) {
            this.handleError(error);
        }
    }

    @Get("/:id")
    public getById(_: any, ctx: any) {
        try {
            const id = parseInt(ctx.pathParameters.id);
            const entity = this.repository.findById(id);
            if (entity) {
                return entity;
            } else {
                HttpUtils.sendResponseNotFound("Product not found");
            }
        } catch (error: any) {
            this.handleError(error);
        }
    }

    @Put("/:id")
    public update(entity: any, ctx: any) {
        try {
            entity.Id = ctx.pathParameters.id;
            this.validateEntity(entity);
            this.repository.update(entity);
            return entity;
        } catch (error: any) {
            this.handleError(error);
        }
    }

    @Delete("/:id")
    public deleteById(_: any, ctx: any) {
        try {
            const id = ctx.pathParameters.id;
            const entity = this.repository.findById(id);
            if (entity) {
                this.repository.deleteById(id);
                HttpUtils.sendResponseNoContent();
            } else {
                HttpUtils.sendResponseNotFound("Product not found");
            }
        } catch (error: any) {
            this.handleError(error);
        }
    }

    private handleError(error: any) {
        if (error.name === "ForbiddenError") {
            HttpUtils.sendForbiddenRequest(error.message);
        } else if (error.name === "ValidationError") {
            HttpUtils.sendResponseBadRequest(error.message);
        } else {
            HttpUtils.sendInternalServerError(error.message);
        }
    }

    private validateEntity(entity: any): void {
        if (entity.Name?.length > 500) {
            throw new ValidationError(`The 'Name' exceeds the maximum length of [500] characters`);
        }
        if (entity.Title === null || entity.Title === undefined) {
            throw new ValidationError(`The 'Title' property is required, provide a valid value`);
        }
        if (entity.Title?.length > 200) {
            throw new ValidationError(`The 'Title' exceeds the maximum length of [200] characters`);
        }
        if (entity.Model === null || entity.Model === undefined) {
            throw new ValidationError(`The 'Model' property is required, provide a valid value`);
        }
        if (entity.Model?.length > 200) {
            throw new ValidationError(`The 'Model' exceeds the maximum length of [200] characters`);
        }
        if (entity.Batch === null || entity.Batch === undefined) {
            throw new ValidationError(`The 'Batch' property is required, provide a valid value`);
        }
        if (entity.Batch?.length > 50) {
            throw new ValidationError(`The 'Batch' exceeds the maximum length of [50] characters`);
        }
        if (entity.BaseUnit?.length > 20) {
            throw new ValidationError(`The 'BaseUnit' exceeds the maximum length of [20] characters`);
        }
        if (entity.SKU?.length > 64) {
            throw new ValidationError(`The 'SKU' exceeds the maximum length of [64] characters`);
        }
        if (entity.UPC?.length > 20) {
            throw new ValidationError(`The 'UPC' exceeds the maximum length of [20] characters`);
        }
        if (entity.EAN?.length > 20) {
            throw new ValidationError(`The 'EAN' exceeds the maximum length of [20] characters`);
        }
        if (entity.JAN?.length > 20) {
            throw new ValidationError(`The 'JAN' exceeds the maximum length of [20] characters`);
        }
        if (entity.ISBN?.length > 20) {
            throw new ValidationError(`The 'ISBN' exceeds the maximum length of [20] characters`);
        }
        if (entity.MPN?.length > 40) {
            throw new ValidationError(`The 'MPN' exceeds the maximum length of [40] characters`);
        }
        if (!RegExp(/^[1-9]\d*$/).test(entity.Weight)) {
            throw new ValidationError(`The value provided for the 'Weight' property ('[${entity.Weight}]') doesn't match the required pattern '^[1-9]\d*$'`);
        }
        if (!RegExp(/^[1-9]\d*$/).test(entity.Height)) {
            throw new ValidationError(`The value provided for the 'Height' property ('[${entity.Height}]') doesn't match the required pattern '^[1-9]\d*$'`);
        }
        if (!RegExp(/^[1-9]\d*$/).test(entity.Length)) {
            throw new ValidationError(`The value provided for the 'Length' property ('[${entity.Length}]') doesn't match the required pattern '^[1-9]\d*$'`);
        }
        if (!RegExp(/^[1-9]\d*$/).test(entity.Width)) {
            throw new ValidationError(`The value provided for the 'Width' property ('[${entity.Width}]') doesn't match the required pattern '^[1-9]\d*$'`);
        }
        if (!RegExp(/^[1-9]\d*$/).test(entity.BoxWeight)) {
            throw new ValidationError(`The value provided for the 'BoxWeight' property ('[${entity.BoxWeight}]') doesn't match the required pattern '^[1-9]\d*$'`);
        }
        if (!RegExp(/^[1-9]\d*$/).test(entity.BoxHeight)) {
            throw new ValidationError(`The value provided for the 'BoxHeight' property ('[${entity.BoxHeight}]') doesn't match the required pattern '^[1-9]\d*$'`);
        }
        if (!RegExp(/^[1-9]\d*$/).test(entity.BoxLength)) {
            throw new ValidationError(`The value provided for the 'BoxLength' property ('[${entity.BoxLength}]') doesn't match the required pattern '^[1-9]\d*$'`);
        }
        if (!RegExp(/^[1-9]\d*$/).test(entity.BoxWidth)) {
            throw new ValidationError(`The value provided for the 'BoxWidth' property ('[${entity.BoxWidth}]') doesn't match the required pattern '^[1-9]\d*$'`);
        }
        for (const next of validationModules) {
            next.validate(entity);
        }
    }

}
