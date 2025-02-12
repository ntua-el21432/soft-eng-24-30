se2430 logout
se2430 login --username sim --passw sim
se2430 healthcheck
se2430 resetpasses
se2430 healthcheck
se2430 resetstations
se2430 healthcheck
se2430 admin --addpasses --source passes30.csv
se2430 healthcheck
se2430 tollstationpasses --station AM08 --from 20220603 --to 20220617 --format json
se2430 tollstationpasses --station NAO04 --from 20220603 --to 20220617 --format csv
se2430 tollstationpasses --station NO01 --from 20220603 --to 20220617 --format csv
se2430 tollstationpasses --station OO03 --from 20220603 --to 20220617 --format csv
se2430 tollstationpasses --station XXX --from 20220603 --to 20220617 --format csv
se2430 tollstationpasses --station OO03 --from 20220603 --to 20220617 --format YYY
se2430 errorparam --station OO03 --from 20220603 --to 20220617 --format csv
se2430 tollstationpasses --station AM08 --from 20220604 --to 20220615 --format json
se2430 tollstationpasses --station NAO04 --from 20220604 --to 20220615 --format csv
se2430 tollstationpasses --station NO01 --from 20220604 --to 20220615 --format csv
se2430 tollstationpasses --station OO03 --from 20220604 --to 20220615 --format csv
se2430 tollstationpasses --station XXX --from 20220604 --to 20220615 --format csv
se2430 tollstationpasses --station OO03 --from 20220604 --to 20220615 --format YYY
se2430 passanalysis --stationop AM --tagop NAO --from 20220603 --to 20220617 --format json
se2430 passanalysis --stationop NAO --tagop AM --from 20220603 --to 20220617 --format csv
se2430 passanalysis --stationop NO --tagop OO --from 20220603 --to 20220617 --format csv
se2430 passanalysis --stationop OO --tagop KO --from 20220603 --to 20220617 --format csv
se2430 passanalysis --stationop XXX --tagop KO --from 20220603 --to 20220617 --format csv
se2430 passanalysis --stationop AM --tagop NAO --from 20220604 --to 20220615 --format json
se2430 passanalysis --stationop NAO --tagop AM --from 20220604 --to 20220615 --format csv
se2430 passanalysis --stationop NO --tagop OO --from 20220604 --to 20220615 --format csv
se2430 passanalysis --stationop OO --tagop KO --from 20220604 --to 20220615 --format csv
se2430 passanalysis --stationop XXX --tagop KO --from 20220604 --to 20220615 --format csv
se2430 passescost --stationop AM --tagop NAO --from 20220603 --to 20220617 --format json
se2430 passescost --stationop NAO --tagop AM --from 20220603 --to 20220617 --format csv
se2430 passescost --stationop NO --tagop OO --from 20220603 --to 20220617 --format csv
se2430 passescost --stationop OO --tagop KO --from 20220603 --to 20220617 --format csv
se2430 passescost --stationop XXX --tagop KO --from 20220603 --to 20220617 --format csv
se2430 passescost --stationop AM --tagop NAO --from 20220604 --to 20220615 --format json
se2430 passescost --stationop NAO --tagop AM --from 20220604 --to 20220615 --format csv
se2430 passescost --stationop NO --tagop OO --from 20220604 --to 20220615 --format csv
se2430 passescost --stationop OO --tagop KO --from 20220604 --to 20220615 --format csv
se2430 passescost --stationop XXX --tagop KO --from 20220604 --to 20220615 --format csv
se2430 chargesby --opid NAO --from 20220603 --to 20220617 --format json
se2430 chargesby --opid GE --from 20220603 --to 20220617 --format csv
se2430 chargesby --opid OO --from 20220603 --to 20220617 --format csv
se2430 chargesby --opid KO --from 20220603 --to 20220617 --format csv
se2430 chargesby --opid NO --from 20220603 --to 20220617 --format csv
se2430 chargesby --opid NAO --from 20220604 --to 20220615 --format json
se2430 chargesby --opid GE --from 20220604 --to 20220615 --format csv
se2430 chargesby --opid OO --from 20220604 --to 20220615 --format csv
se2430 chargesby --opid KO --from 20220604 --to 20220615 --format csv
se2430 chargesby --opid NO --from 20220604 --to 20220615 --format csv