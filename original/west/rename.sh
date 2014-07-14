#!/bin/bash
for f in $(ls); do 
	name=$(echo $f | cut --fields=2 --delimiter=.)
	name="$name.png"
	convert $f $name
done
