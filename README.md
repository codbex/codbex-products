# codbex-products
Products Management Application

### Model

![model](images/products-model.png)

### Application

#### Launchpad

![launchpad](images/products-launchpad.png)

#### Management

![management](images/products-management.png)

![management](images/products-product-category.png)

![management](images/products-catalogue.png)

![management](images/products-product-type.png)

### Infrastructure

#### Build

	docker build -t codbex-products:1.0.0 .

#### Run

	docker run --name codbex-products -d -p 8080:8080 codbex-products:1.0.0

#### Clean

	docker rm codbex-products