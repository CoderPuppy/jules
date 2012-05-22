line() {
	echo ""
	echo "-------------------------------------------------------------------------------------------"
	echo ""
}

echo "Running Test"
line
echo "Deleting Old Data"
echo ""
rm -rf test/
echo "Done"
line
echo "Creating Project: test"
echo ""
./bin/jules.js new test
echo ""
echo "Done"
