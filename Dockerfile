# Docker descriptor for codbex-products     
# License - http://www.eclipse.org/legal/epl-v20.html

FROM ghcr.io/codbex/codbex-gaia:0.5.0

COPY codbex-products target/dirigible/repository/root/registry/public/codbex-products
COPY codbex-products-data target/dirigible/repository/root/registry/public/codbex-products-data

ENV DIRIGIBLE_HOME_URL=/services/web/codbex-products/gen/index.html
