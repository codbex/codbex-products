import { SalesOrderItemRepository } from "codbex-orders/gen/codbex-orders/dao/SalesOrder/SalesOrderItemRepository";
import { SalesOrderRepository } from "codbex-orders/gen/codbex-orders/dao/SalesOrder/SalesOrderRepository";
import { ProductRepository } from "../../gen/codbex-products/dao/Products/ProductRepository";
import { ProductSetRepository } from "../../gen/codbex-products/dao/Products/ProductSetRepository";
import { CatalogueSetRepository } from "../../gen/codbex-products/dao/Catalogues/CatalogueSetRepository";
import { CatalogueRepository } from "../../gen/codbex-products/dao/Catalogues/CatalogueRepository"


export const trigger = (event) => {

    const SalesOrderItemDao = new SalesOrderItemRepository();
    const SalesOrderDao = new SalesOrderRepository();
    const ProductDao = new ProductRepository();
    const ProductSetDao = new ProductSetRepository();
    const CatalogueSetDao = new CatalogueSetRepository();
    const CatalogueDao = new CatalogueRepository();

    const catalogueItem = event.entity;
    const operation = event.operation;

    if (operation === "create") {
        const product = ProductDao.findById(catalogueItem.Product);
        catalogueItem.BaseUnit = product.BaseUnit;
        CatalogueDao.update(catalogueItem);

        let productSets = ProductSetDao.findAll({
            $filter: {
                equals: {
                    Product: catalogueItem.Product
                }
            }
        }).sort((a, b) => b.Ratio - a.Ratio);

        let remainingQuantity = catalogueItem.Quantity;

        productSets.forEach(function (item) {
            const quantityForSet = Math.floor(remainingQuantity / item.Ratio);
            remainingQuantity -= quantityForSet * item.Ratio;

            CatalogueSetDao.create({
                Catalogue: catalogueItem.Id,
                ProductSet: item.Id,
                Quantity: quantityForSet
            });
        });

        const salesOrders = SalesOrderDao.findAll({
            $filter: {
                equals: {
                    Store: catalogueItem.Store
                }
            }
        });

        salesOrders.forEach(function (order) {
            let salesOrderItems = SalesOrderItemDao.findAll({
                $filter: {
                    equals: {
                        SalesOrder: order.Id,
                        Product: catalogueItem.Product
                    }
                }
            });

            salesOrderItems.forEach(function (item) {
                item.Availability = catalogueItem.Quantity;
                SalesOrderItemDao.update(item);
            });
        });
    }

    if (operation === "update") {
        const product = ProductDao.findById(catalogueItem.Product);
        catalogueItem.BaseUnit = product.BaseUnit;
        CatalogueDao.update(catalogueItem);

        let productSets = ProductSetDao.findAll({
            $filter: {
                equals: {
                    Product: catalogueItem.Product
                }
            }
        }).sort((a, b) => b.Ratio - a.Ratio);

        let remainingQuantity = catalogueItem.Quantity;

        productSets.forEach(function (item) {
            const quantityForSet = Math.floor(remainingQuantity / item.Ratio);
            remainingQuantity -= quantityForSet * item.Ratio;

            const existingSet = SetDao.find({
                $filter: {
                    equals: {
                        Catalogue: catalogueItem.Id,
                        ProductSet: item.Id
                    }
                }
            });

            if (existingSet) {
                existingSet.Quantity = quantityForSet;
                CatalogueSetDao.update(existingSet);
            } else {
                CatalogueSetDao.create({
                    Catalogue: catalogueItem.Id,
                    ProductSet: item.Id,
                    Quantity: quantityForSet
                });
            }
        });

        const salesOrders = SalesOrderDao.findAll({
            $filter: {
                equals: {
                    Store: catalogueItem.Store
                }
            }
        });

        salesOrders.forEach(function (order) {
            let salesOrderItems = SalesOrderItemDao.findAll({
                $filter: {
                    equals: {
                        SalesOrder: order.Id,
                        Product: catalogueItem.Product
                    }
                }
            });

            salesOrderItems.forEach(function (item) {
                item.Availability = catalogueItem.Quantity;
                SalesOrderItemDao.update(item);
            });
        });
    }
}

