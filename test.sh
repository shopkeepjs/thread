npx jsr publish > file.txt
echo $OUTPUT
# if grep -q "Skipping, already published" <<< $OUTPUT; then
# echo "Error: The package has already been published. Please increment the version number."
# exit 1
