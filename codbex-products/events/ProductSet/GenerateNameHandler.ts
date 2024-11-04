import { ProductSetRepository } from "../../gen/codbex-products/dao/Products/ProductSetRepository";


export const trigger = (event) => {

    const ProductSetDao = new ProductSetRepository();

    const set = event.entity;
    const operation = event.operation;

    if (operation === "create" || operation === "update") {

        set.Name = set.UoM.Name + "/" + set.Length + "x" + set.Width + "x" + set.Length + "/" + set.Weight;

        ProductSetDao.update(set);
    }
}

