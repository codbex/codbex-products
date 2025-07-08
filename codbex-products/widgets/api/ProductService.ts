import { ProductRepository as ProductDao } from "codbex-products/gen/codbex-products/dao/Products/ProductRepository";
import { ProductCategoryRepository as CategoryDao } from "codbex-products/gen/codbex-products/dao/Settings/ProductCategoryRepository";

import { Controller, Get } from "sdk/http";
import { query } from "sdk/db";

@Controller
class ProductService {

    private readonly productDao;
    private readonly categoryDao;

    constructor() {
        this.productDao = new ProductDao();
        this.categoryDao = new CategoryDao();
    }

    @Get("/productData")
    public productData() {
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);

        const allProducts = this.productDao.findAll();

        const activeProducts = this.productDao.findAll({
            $filter: {
                equals: {
                    Enabled: true
                }
            }
        }).length;

        const inactiveProducts = this.productDao.findAll({
            $filter: {
                equals: {
                    Enabled: false
                }
            }
        }).length;

        const activeCategories: number = this.categoryDao.count();

        return {
            "ActiveProducts": activeProducts,
            "InactiveProducts": inactiveProducts,
            "AllProducts": allProducts.length,
            "ActiveCategories": activeCategories
        };
    }
}
