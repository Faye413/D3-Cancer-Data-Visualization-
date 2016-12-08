A D3.js project intended to visulize 1999-2013 US cancer data (from CDC). These statistics can be filtered by factors such as year, state, age group, race, ethnicity, gender, and cancer site. 

To run: python -m SimpleHTTPServer 8000

<img width="1273" alt="screen shot 2016-12-08 at 5 20 28 pm" src="https://cloud.githubusercontent.com/assets/5462046/21030678/e689ff4a-bd6d-11e6-85e2-abe9ece314b6.png">
<img width="1257" alt="screen shot 2016-12-08 at 5 20 37 pm" src="https://cloud.githubusercontent.com/assets/5462046/21030681/e79774e4-bd6d-11e6-86bf-7ae34e0f59e7.png">

Interaction methods:

1. A map of the United States which is color-coded based on the aggregate number of incidents in a particular year span. This map will include a slider that allows the user to view this map for different time spans.

2. A line graph that represents trends in cancer forms over a particular year span and a pie chart representing distribution of cancers are generated by a click on a state in the map. Hovering over a cancer’s line reduces the visibility of the other lines for the sake of emphasis and also makes all other pie slices not pertinent to that cancer gray. This is an example of linking. Filtering is implemented by means of a legend that removes lines and slices in order to allow for smaller cancer-to-cancer comparisons.

3. Clicking on a dot in the line graph dynamically changes three bar charts at the bottom of the visualization to reflect the distributions of a particular cancer in a year over age groups, races, and genders. This is an example of dynamic querying.               
4. Details on demand is possible for all of the visualizations (map, line graph, bar chart) by means of tooltips which provide more explicit information about the corresponding scenarios.
