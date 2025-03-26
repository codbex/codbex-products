import { Controller, Get, Post, Put, Delete, response } from "sdk/http"
import { Extensions } from "sdk/extensions"
import { ProductPackagingRepository, ProductPackagingEntityOptions } from "../../dao/Products/ProductPackagingRepository";
import { user } from "sdk/security"
import { ForbiddenError } from "../utils/ForbiddenError";
import { ValidationError } from "../utils/ValidationError";
import { HttpUtils } from "../utils/HttpUtils";

const validationModules = await Extensions.loadExtensionModules("codbex-products-Products-ProductPackaging", ["validate"]);

@Controller
class ProductPackagingService {

    private readonly repository = new ProductPackagingRepository();

    @Get("/")
    public getAll(_: any, ctx: any) {
        try {
            this.checkPermissions("read");
            const options: ProductPackagingEntityOptions = {
                $limit: ctx.queryParameters["$limit"] ? parseInt(ctx.queryParameters["$limit"]) : undefined,
                $offset: ctx.queryParameters["$offset"] ? parseInt(ctx.queryParameters["$offset"]) : undefined
            };

            let Product = parseInt(ctx.queryParameters.Product);
            Product = isNaN(Product) ? ctx.queryParameters.Product : Product;

            if (Product !== undefined) {
                options.$filter = {
                    equals: {
                        Product: Product
                    }
                };
            }

            return this.repository.findAll(options);
        } catch (error: any) {
            this.handleError(error);
        }
    }

    @Post("/")
    public create(entity: any) {
        try {
            this.checkPermissions("write");
            this.validateEntity(entity);
            entity.Id = this.repository.create(entity);
            response.setHeader("Content-Location", "/services/ts/codbex-products/gen/codbex-products/api/Products/ProductPackagingService.ts/" + entity.Id);
            response.setStatus(response.CREATED);
            return entity;
        } catch (error: any) {
            this.handleError(error);
        }
    }

    @Get("/count")
    public count() {
        try {
            this.checkPermissions("read");
            return this.repository.count();
        } catch (error: any) {
            this.handleError(error);
        }
    }

    @Post("/count")
    public countWithFilter(filter: any) {
        try {
            this.checkPermissions("read");
            return this.repository.count(filter);
        } catch (error: any) {
            this.handleError(error);
        }
    }

    @Post("/search")
    public search(filter: any) {
        try {
            this.checkPermissions("read");
            return this.repository.findAll(filter);
        } catch (error: any) {
            this.handleError(error);
        }
    }

    @Get("/:id")
    public getById(_: any, ctx: any) {
        try {
            this.checkPermissions("read");
            const id = parseInt(ctx.pathParameters.id);
            const entity = this.repository.findById(id);
            if (entity) {
                return entity;
            } else {
                HttpUtils.sendResponseNotFound("ProductPackaging not found");
            }
        } catch (error: any) {
            this.handleError(error);
        }
    }

    @Put("/:id")
    public update(entity: any, ctx: any) {
        try {
            this.checkPermissions("write");
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
            this.checkPermissions("write");
            const id = ctx.pathParameters.id;
            const entity = this.repository.findById(id);
            if (entity) {
                this.repository.deleteById(id);
                HttpUtils.sendResponseNoContent();
            } else {
                HttpUtils.sendResponseNotFound("ProductPackaging not found");
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

    private checkPermissions(operationType: string) {
        if (operationType === "read" && !(user.isInRole("codbex-products.Products.ProductPackagingReadOnly") || user.isInRole("codbex-products.Products.ProductPackagingFullAccess"))) {
            throw new ForbiddenError();
        }
        if (operationType === "write" && !user.isInRole("codbex-products.Products.ProductPackagingFullAccess")) {
            throw new ForbiddenError();
        }
    }

    private validateEntity(entity: any): void {
        if (entity.UoM === null || entity.UoM === undefined) {
            throw new ValidationError(`The 'UoM' property is required, provide a valid value`);
        }
        if (entity.Product === null || entity.Product === undefined) {
            throw new ValidationError(`The 'Product' property is required, provide a valid value`);
        }
        if (entity.Weight === null || entity.Weight === undefined) {
            throw new ValidationError(`The 'Weight' property is required, provide a valid value`);
        }
        if (entity.Height === null || entity.Height === undefined) {
            throw new ValidationError(`The 'Height' property is required, provide a valid value`);
        }
        if (entity.Length === null || entity.Length === undefined) {
            throw new ValidationError(`The 'Length' property is required, provide a valid value`);
        }
        if (entity.Width === null || entity.Width === undefined) {
            throw new ValidationError(`The 'Width' property is required, provide a valid value`);
        }
        if (entity.Ratio === null || entity.Ratio === undefined) {
            throw new ValidationError(`The 'Ratio' property is required, provide a valid value`);
        }
        if (entity.Name?.length > 500) {
            throw new ValidationError(`The 'Name' exceeds the maximum length of [500] characters`);
        }
        for (const next of validationModules) {
            next.validate(entity);
        }
    }

}
