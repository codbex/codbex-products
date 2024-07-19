import { SalesOrderItemRepository } from "codbex-orders/gen/codbex-orders/dao/SalesOrder/SalesOrderItemRepository";
import { SalesOrderRepository } from "codbex-orders/gen/codbex-orders/dao/SalesOrder/SalesOrderRepository";


export const trigger = (event) => {

    const SalesOrderItemDao = new SalesOrderItemRepository();
    const SalesOrderDao = new SalesOrderRepository();

    const catalogueItem = event.entity;
    const operation = event.operation;

    if (operation === "update") {

        const salesOrders = SalesOrderDao.findAll({
            $filter: {
                equals: {
                    Store: catalogueItem.Store
                }
            }
        });

        console.log(salesOrders);

        salesOrders.forEach(function (order) {

            let salesOrderItems = SalesOrderItemDao.findAll({
                $filter: {
                    equals: {
                        SalesOrder: order.Id,
                        Product: catalogueItem.Product
                    }
                }
            });

            console.log(salesOrderItems);

            salesOrderItems.forEach(function (item) {
                item.Availability = catalogueItem.Quantity;
                console.log(item.Availability);
                SalesOrderItemDao.update(item);
            });

        });
    }

}