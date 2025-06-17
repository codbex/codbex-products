import { ProductPackagingRepository } from "../../gen/codbex-products/dao/Products/ProductPackagingRepository";
import { UoMRepository } from "codbex-uoms/gen/codbex-uoms/dao/Settings/UoMRepository"

export const trigger = (event) => {

    const ProductPackagingDao = new ProductPackagingRepository();
    const UoMDao = new UoMRepository();

    const productPackaging = event.entity;
    const operation = event.operation;

    if (operation === "create" || operation === "update") {

        const uom = UoMDao.findById(productPackaging.UoM);

        productPackaging.Name = uom.Name + "/" + productPackaging.Width + "x"
            + productPackaging.Length + "x" + productPackaging.Height + "/" + productPackaging.Weight;

        ProductPackagingDao.update(productPackaging);
    }

}