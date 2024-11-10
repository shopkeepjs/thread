npx jsr publish
echo "$output"
if echo "$output" | grep -q 'Skipping, already published'; then
exit 1
fi
exit 0