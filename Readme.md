# Smart Layout

## Overview

This project is purely for testing and play.

This project is about a better layout algorithm for the **ListView**.

## The ListView

The listview is a plugin of jQuery that will provide everything function like [jquery datatables](http://www.datatables.net) (The pagination, the sort function, the search function).

But ListView will present all the data in the pattern of a ListView(of Big Icons display).

ListView will take flow layout as default.

But as we all know about the flow left layout.

It'll waste lots space when the items are not at the same height, in some cases.

## The Layout Algorithm

So, I wrote this smart layout algrithm to solve this problem.

This project contains 3 important functions:

1. Algorithm for flow left: This algorithm will calculate the item's layout using the default flow left layout pattern(in a position absolute way), if not using with other algorithms, this will be useless, since browser has implemented the flow left layout just using CSS
2. Algorithm for smart layout: This algorithm will try to take up as many space from left to the right when the item is being layout (in a position absolute way)
3. Algorithm for smart layout using flow left: This is a better algorithm than position absolute (since in position absolute way, the container's height can't be calculated automaticly.), this algorithm will using position relative.