# codbex-products
Products Management Application

### Model

![model](images/products-model.png)

### Application

#### Launchpad

![launchpad](images/products-launchpad.png)

#### Management

![management](images/products-management.png)


![management](images/products-product-type-management.png)

### Infrastructure

#### Build

	docker build -t products-uoms:1.0.0 .

#### Run

	docker run --name products-uoms -d -p 8080:8080 products-uoms:1.0.0

#### Clean

	docker rm products-uoms