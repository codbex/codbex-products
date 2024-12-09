import { ProductSetRepository } from "../../gen/codbex-products/dao/Products/ProductSetRepository";
import { UoMRepository } from "codbex-uoms/gen/codbex-uoms/dao/UnitsOfMeasures/UoMRepository"

export const trigger = (event) => {
    const ProductSetDao = new ProductSetRepository();
    const UoMDao = new UoMRepository();

    const productSet = event.entity;
    const operation = event.operation;

    if (operation === "create" || operation === "update") {
        const uom = UoMDao.findById(productSet.UoM);
        productSet.Name = uom.Name + "/" + productSet.Width + "x" + productSet.Length + "x" + productSet.Height + "/" + productSet.Weight;

        ProductSetDao.update(productSet);
    }
}