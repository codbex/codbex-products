import { ProductSetRepository } from "../../gen/codbex-products/dao/Products/ProductSetRepository";
import { UoMRepository } from "codbex-uoms/gen/codbex-uoms/dao/UnitsOfMeasures/UoMRepository";


export const trigger = (event) => {

    const ProductSetDao = new ProductSetRepository();
    const UoMDao = new UoMRepository();

    const set = event.entity;
    const operation = event.operation;

    if (operation === "create" || operation === "update") {

        const uom = UoMDao.findById(set.UoM);

        set.Name = uom.Name + "/" + set.Length + "x" + set.Width + "x" + set.Length + "/" + set.Weight;

        ProductSetDao.update(set);
    }
}

