const query = require("db/query");
const producer = require("messaging/producer");
const daoApi = require("db/dao");

let dao = daoApi.create({
	table: "CODBEX_PRODUCTDETAILS",
	properties: [
		{
			name: "Id",
			column: "PRODUCTDETAILS_ID",
			type: "INTEGER",
			id: true,
			autoIncrement: true,
		},
 {
			name: "Name",
			column: "PRODUCTDETAILS_NAME",
			type: "VARCHAR",
		},
 {
			name: "Value",
			column: "PRODUCTDETAILS_VALUE",
			type: "VARCHAR",
		},
 {
			name: "Product",
			column: "PRODUCTDETAILS_PRODUCTID",
			type: "INTEGER",
		}
]
});

exports.list = function(settings) {
	return dao.list(settings);
};

exports.get = function(id) {
	return dao.find(id);
};

exports.create = function(entity) {
	let id = dao.insert(entity);
	triggerEvent("Create", {
		table: "CODBEX_PRODUCTDETAILS",
		key: {
			name: "Id",
			column: "PRODUCTDETAILS_ID",
			value: id
		}
	});
	return id;
};

exports.update = function(entity) {
	dao.update(entity);
	triggerEvent("Update", {
		table: "CODBEX_PRODUCTDETAILS",
		key: {
			name: "Id",
			column: "PRODUCTDETAILS_ID",
			value: entity.Id
		}
	});
};

exports.delete = function(id) {
	dao.remove(id);
	triggerEvent("Delete", {
		table: "CODBEX_PRODUCTDETAILS",
		key: {
			name: "Id",
			column: "PRODUCTDETAILS_ID",
			value: id
		}
	});
};

exports.count = function (Product) {
	let resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_PRODUCTDETAILS" WHERE "PRODUCTDETAILS_PRODUCTID" = ?', [Product]);
	if (resultSet !== null && resultSet[0] !== null) {
		if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
			return resultSet[0].COUNT;
		} else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
			return resultSet[0].count;
		}
	}
	return 0;
};

exports.customDataCount = function() {
	let resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_PRODUCTDETAILS"');
	if (resultSet !== null && resultSet[0] !== null) {
		if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
			return resultSet[0].COUNT;
		} else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
			return resultSet[0].count;
		}
	}
	return 0;
};

function triggerEvent(operation, data) {
	producer.queue("codbex-products/Products1/ProductDetails/" + operation).send(JSON.stringify(data));
}