import { SalesOrderItemRepository } from "codbex-orders/gen/codbex-orders/dao/SalesOrder/SalesOrderItemRepository";
import { SalesOrderRepository } from "codbex-orders/gen/codbex-orders/dao/SalesOrder/SalesOrderRepository";


export const trigger = (event) => {

    const SalesOrderItemDao = new SalesOrderItemRepository();
    const SalesOrderDao = new SalesOrderRepository();

    const catalogueItem = event.entity;
    const operation = event.operation;

    if (operation === "update") {

        const salesOrder = SalesOrderDao.findAll({
            $filter: {
                equals: {
                    Store: catalogueItem.Store
                }
            }
        });

        let salesOrderItems = SalesOrderItemDao.findAll({
            $filter: {
                equals: {
                    SalesOrder: salesOrder[0].Id
                }
            }
        });

        salesOrderItems.forEach(function (item) {
            SalesOrderItemDao.update(item);
        });

    }

}