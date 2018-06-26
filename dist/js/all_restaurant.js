class DBHelper{static get DATABASE_URL(){return"http://localhost:1337/restaurants"}static openDatabase(){return navigator.serviceWorker?idb.open("restaurant-db",1,function(e){e.createObjectStore("restaurants",{keyPath:"id"})}):Promise.resolve()}static fetchRestaurants(e){DBHelper.openDatabase().then(function(e){return e?e.transaction("restaurants","readwrite").objectStore("restaurants").getAll():void 0}).then(function(t){0!==t.length&&e(null,t)}),fetch(DBHelper.DATABASE_URL).then(function(t){200===t.status?t.json().then(function(t){DBHelper.openDatabase().then(function(e){if(e){let n=e.transaction("restaurants","readwrite").objectStore("restaurants");t.forEach(function(e){n.put(e)})}}),e(null,t)}):console.log("Fetch Issue - Status Code: "+t.status)}).catch(function(e){console.log("Fetch Error: ",e)})}static fetchRestaurantById(e,t){DBHelper.fetchRestaurants((n,r)=>{if(n)t(n,null);else{const n=r.find(t=>t.id==e);n?t(null,n):t("Restaurant does not exist",null)}})}static fetchRestaurantByCuisine(e,t){DBHelper.fetchRestaurants((n,r)=>{if(n)t(n,null);else{const n=r.filter(t=>t.cuisine_type==e);t(null,n)}})}static fetchRestaurantByNeighborhood(e,t){DBHelper.fetchRestaurants((n,r)=>{if(n)t(n,null);else{const n=r.filter(t=>t.neighborhood==e);t(null,n)}})}static fetchRestaurantByCuisineAndNeighborhood(e,t,n){DBHelper.fetchRestaurants((r,a)=>{if(r)n(r,null);else{let r=a;"all"!=e&&(r=r.filter(t=>t.cuisine_type==e)),"all"!=t&&(r=r.filter(e=>e.neighborhood==t)),n(null,r)}})}static fetchNeighborhoods(e){DBHelper.fetchRestaurants((t,n)=>{if(t)e(t,null);else{const t=n.map((e,t)=>n[t].neighborhood),r=t.filter((e,n)=>t.indexOf(e)==n);e(null,r)}})}static fetchCuisines(e){DBHelper.fetchRestaurants((t,n)=>{if(t)e(t,null);else{const t=n.map((e,t)=>n[t].cuisine_type),r=t.filter((e,n)=>t.indexOf(e)==n);e(null,r)}})}static urlForRestaurant(e){return`./restaurant.html?id=${e.id}`}static imageUrlForRestaurant(e){return`/img/${e.photograph}.webp`}static imageResponsiveUrlForRestaurant(e){return`/img_responsive/${e.id}-320.webp 320w,\n        /img_responsive/${e.id}-480.webp 480w,\n        /img_responsive/${e.id}-640.webp 640w,\n        /img_responsive/${e.id}-800.webp 800w`}static mapMarkerForRestaurant(e,t){return new google.maps.Marker({position:e.latlng,title:e.name,url:DBHelper.urlForRestaurant(e),map:t,animation:google.maps.Animation.DROP})}}let restaurant;var map;const photographAlts={1:"Sereval groups of people having quality time at a restaurant.",2:"A lovely margeritta pizza",3:"An empty restaurant setting which has heaters",4:"A corner shot of the outside of the restaurat.",5:"A crowded restaurant and staff serving food from behind the bar.",6:"Restaurant with wooden tables, charis, and a US flag as a wall decoration",7:"a dog watching from the outside of a crowded burger shop, accompanied by two men.",8:"Close up of the dutch restaurant logo beside a flowering tree",9:"Black and white picture of people eating at an asian restaurat.",10:"Empty restaurant's white chairs, walls and ceilings."};window.initMap=(()=>{fetchRestaurantFromURL((e,t)=>{e?console.error(e):(self.map=new google.maps.Map(document.getElementById("map"),{zoom:16,center:t.latlng,scrollwheel:!1}),fillBreadcrumb(),DBHelper.mapMarkerForRestaurant(self.restaurant,self.map))})}),callMap=document.getElementById("mapToggle").addEventListener("click",function(e){"block"===document.getElementById("map-container").style.display?(document.getElementById("map-container").style.display="none",window.initMap()):document.getElementById("map-container").style.display="block"}),fetchRestaurantFromURL=(e=>{if(self.restaurant)return void e(null,self.restaurant);const t=getParameterByName("id");t?DBHelper.fetchRestaurantById(t,(t,n)=>{self.restaurant=n,n?(fillRestaurantHTML(),e(null,n)):console.error(t)}):(error="No restaurant id in URL",e(error,null))}),fillRestaurantHTML=((e=self.restaurant)=>{document.getElementById("restaurant-name").innerHTML=e.name,document.getElementById("restaurant-address").innerHTML=e.address;const t=document.getElementById("restaurant-img");t.className="restaurant-img",t.src=DBHelper.imageUrlForRestaurant(e),t.srcset=DBHelper.imageResponsiveUrlForRestaurant(e),t.alt=photographAlts[e.id],document.getElementById("restaurant-cuisine").innerHTML=e.cuisine_type,e.operating_hours&&fillRestaurantHoursHTML(),fillReviewsHTML()}),fillRestaurantHoursHTML=((e=self.restaurant.operating_hours)=>{const t=document.getElementById("restaurant-hours");t.innerHTML="";for(let n in e){const r=document.createElement("tr"),a=document.createElement("td");a.innerHTML=n,r.appendChild(a);const s=document.createElement("td");s.innerHTML=e[n],r.appendChild(s),t.appendChild(r)}}),fillReviewsHTML=((e=self.restaurant.reviews)=>{const t=document.getElementById("reviews-container");t.innerHTML='<ul id="reviews-list"></ul>';const n=document.createElement("h2");if(n.innerHTML="Reviews",n.tabIndex="0",t.appendChild(n),!e){const e=document.createElement("p");return e.innerHTML="No reviews yet!",void t.appendChild(e)}const r=document.getElementById("reviews-list");e.forEach(e=>{r.appendChild(createReviewHTML(e))}),t.appendChild(r)}),createReviewHTML=(e=>{const t=document.createElement("li");t.tabIndex="0";const n=document.createElement("h5");n.innerHTML=e.date,t.appendChild(n);const r=document.createElement("h1");r.innerHTML=e.name,t.appendChild(r);const a=document.createElement("i");a.innerHTML=`Rating: ${e.rating}`,t.appendChild(a);const s=document.createElement("p");return s.innerHTML=e.comments,t.appendChild(s),t}),fillBreadcrumb=((e=self.restaurant)=>{const t=document.getElementById("breadcrumb"),n=t.querySelectorAll("li");for(element of n)element.removeAttribute("aria-current");const r=document.createElement("li");r.setAttribute("aria-current","page"),2!==t.childElementCount&&(r.innerHTML=e.name,t.appendChild(r))}),getParameterByName=((e,t)=>{t||(t=window.location.href),e=e.replace(/[\[\]]/g,"\\$&");const n=new RegExp(`[?&]${e}(=([^&#]*)|&|#|$)`).exec(t);return n?n[2]?decodeURIComponent(n[2].replace(/\+/g," ")):"":null}),navigator.serviceWorker&&navigator.serviceWorker.register("sw.js").then(()=>console.log("Passed Test")),registerServiceWorker=(()=>{navigator.serviceWorker&&navigator.serviceWorker.register("/sw.js").catch(function(){console.log("Something went wrong. ServiceWorker not registered")})}),registerServiceWorker();
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImRiaGVscGVyLmpzIiwicmVzdGF1cmFudF9pbmZvLmpzIiwicmVnaXN0ZXJTZXJ2aWNlV29ya2VyLmpzIl0sIm5hbWVzIjpbIkRCSGVscGVyIiwiREFUQUJBU0VfVVJMIiwiW29iamVjdCBPYmplY3RdIiwibmF2aWdhdG9yIiwic2VydmljZVdvcmtlciIsImlkYiIsIm9wZW4iLCJ1cGdyYWRlRGIiLCJjcmVhdGVPYmplY3RTdG9yZSIsImtleVBhdGgiLCJQcm9taXNlIiwicmVzb2x2ZSIsImNhbGxiYWNrIiwib3BlbkRhdGFiYXNlIiwidGhlbiIsImRiIiwidHJhbnNhY3Rpb24iLCJvYmplY3RTdG9yZSIsImdldEFsbCIsInJlc3RhdXJhbnRzIiwibGVuZ3RoIiwiZmV0Y2giLCJyZXNwb25zZSIsInN0YXR1cyIsImpzb24iLCJzdG9yZSIsImZvckVhY2giLCJyZXN0YXVyYW50IiwicHV0IiwiY29uc29sZSIsImxvZyIsImNhdGNoIiwiZXJyIiwiaWQiLCJmZXRjaFJlc3RhdXJhbnRzIiwiZXJyb3IiLCJmaW5kIiwiciIsImN1aXNpbmUiLCJyZXN1bHRzIiwiZmlsdGVyIiwiY3Vpc2luZV90eXBlIiwibmVpZ2hib3Job29kIiwibmVpZ2hib3Job29kcyIsIm1hcCIsInYiLCJpIiwidW5pcXVlTmVpZ2hib3Job29kcyIsImluZGV4T2YiLCJjdWlzaW5lcyIsInVuaXF1ZUN1aXNpbmVzIiwicGhvdG9ncmFwaCIsImdvb2dsZSIsIm1hcHMiLCJNYXJrZXIiLCJwb3NpdGlvbiIsImxhdGxuZyIsInRpdGxlIiwibmFtZSIsInVybCIsInVybEZvclJlc3RhdXJhbnQiLCJhbmltYXRpb24iLCJBbmltYXRpb24iLCJEUk9QIiwicGhvdG9ncmFwaEFsdHMiLCIxIiwiMiIsIjMiLCI0IiwiNSIsIjYiLCI3IiwiOCIsIjkiLCIxMCIsIndpbmRvdyIsImluaXRNYXAiLCJmZXRjaFJlc3RhdXJhbnRGcm9tVVJMIiwic2VsZiIsIk1hcCIsImRvY3VtZW50IiwiZ2V0RWxlbWVudEJ5SWQiLCJ6b29tIiwiY2VudGVyIiwic2Nyb2xsd2hlZWwiLCJmaWxsQnJlYWRjcnVtYiIsIm1hcE1hcmtlckZvclJlc3RhdXJhbnQiLCJjYWxsTWFwIiwiYWRkRXZlbnRMaXN0ZW5lciIsImV2ZW50Iiwic3R5bGUiLCJkaXNwbGF5IiwiZ2V0UGFyYW1ldGVyQnlOYW1lIiwiZmV0Y2hSZXN0YXVyYW50QnlJZCIsImZpbGxSZXN0YXVyYW50SFRNTCIsImlubmVySFRNTCIsImFkZHJlc3MiLCJpbWFnZSIsImNsYXNzTmFtZSIsInNyYyIsImltYWdlVXJsRm9yUmVzdGF1cmFudCIsInNyY3NldCIsImltYWdlUmVzcG9uc2l2ZVVybEZvclJlc3RhdXJhbnQiLCJhbHQiLCJvcGVyYXRpbmdfaG91cnMiLCJmaWxsUmVzdGF1cmFudEhvdXJzSFRNTCIsImZpbGxSZXZpZXdzSFRNTCIsIm9wZXJhdGluZ0hvdXJzIiwiaG91cnMiLCJrZXkiLCJyb3ciLCJjcmVhdGVFbGVtZW50IiwiZGF5IiwiYXBwZW5kQ2hpbGQiLCJ0aW1lIiwicmV2aWV3cyIsImNvbnRhaW5lciIsInRhYkluZGV4Iiwibm9SZXZpZXdzIiwidWwiLCJyZXZpZXciLCJjcmVhdGVSZXZpZXdIVE1MIiwibGkiLCJkYXRlIiwicmF0aW5nIiwiY29tbWVudHMiLCJicmVhZGNydW1iIiwiYnJlYWRjcnVtYkVsZW1lbnRzIiwicXVlcnlTZWxlY3RvckFsbCIsImVsZW1lbnQiLCJyZW1vdmVBdHRyaWJ1dGUiLCJzZXRBdHRyaWJ1dGUiLCJjaGlsZEVsZW1lbnRDb3VudCIsImxvY2F0aW9uIiwiaHJlZiIsInJlcGxhY2UiLCJSZWdFeHAiLCJleGVjIiwiZGVjb2RlVVJJQ29tcG9uZW50IiwicmVnaXN0ZXIiLCJyZWdpc3RlclNlcnZpY2VXb3JrZXIiXSwibWFwcGluZ3MiOiJNQUdNQSxTQU1KQywwQkFFRSxNQUFRLG9DQU9WQyxzQkFFRSxPQUFLQyxVQUFVQyxjQUtSQyxJQUFJQyxLQUFLLGdCQUFpQixFQUFHLFNBQVVDLEdBQ2hDQSxFQUFVQyxrQkFBa0IsZUFDdENDLFFBQVMsU0FMSkMsUUFBUUMsVUFhbkJULHdCQUF3QlUsR0FHdEJaLFNBQVNhLGVBQWVDLEtBQUssU0FBVUMsR0FDckMsT0FBS0EsRUFHSUEsRUFBR0MsWUFBWSxjQUFlLGFBQzNCQyxZQUFZLGVBQ1pDLGNBSlYsSUFNREosS0FBSyxTQUFVSyxHQUNXLElBQXZCQSxFQUFZQyxRQUNoQlIsRUFBUyxLQUFNTyxLQUdqQkUsTUFBTXJCLFNBQVNDLGNBQ2RhLEtBQ0MsU0FBVVEsR0FDZ0IsTUFBcEJBLEVBQVNDLE9BS2JELEVBQVNFLE9BQU9WLEtBQUssU0FBVUssR0FHN0JuQixTQUFTYSxlQUFlQyxLQUFLLFNBQVVDLEdBQ3JDLEdBQUtBLEVBRUUsQ0FDTCxJQUFJVSxFQUFRVixFQUFHQyxZQUFZLGNBQWUsYUFDM0JDLFlBQVksZUFDM0JFLEVBQVlPLFFBQVEsU0FBVUMsR0FDNUJGLEVBQU1HLElBQUlELFFBS2hCZixFQUFTLEtBQU1PLEtBbkJmVSxRQUFRQyxJQUFJLDhCQUFnQ1IsRUFBU0MsVUF1QjFEUSxNQUFNLFNBQVVDLEdBQ2ZILFFBQVFDLElBQUksZ0JBQWlCRSxLQU9qQzlCLDJCQUEyQitCLEVBQUlyQixHQUU3QlosU0FBU2tDLGlCQUFpQixDQUFDQyxFQUFPaEIsS0FDaEMsR0FBSWdCLEVBQ0Z2QixFQUFTdUIsRUFBTyxVQUNYLENBQ0wsTUFBTVIsRUFBYVIsRUFBWWlCLEtBQUtDLEdBQUtBLEVBQUVKLElBQU1BLEdBQzdDTixFQUNGZixFQUFTLEtBQU1lLEdBRWZmLEVBQVMsNEJBQTZCLFNBUzlDVixnQ0FBZ0NvQyxFQUFTMUIsR0FFdkNaLFNBQVNrQyxpQkFBaUIsQ0FBQ0MsRUFBT2hCLEtBQ2hDLEdBQUlnQixFQUNGdkIsRUFBU3VCLEVBQU8sVUFDWCxDQUVMLE1BQU1JLEVBQVVwQixFQUFZcUIsT0FBT0gsR0FBS0EsRUFBRUksY0FBZ0JILEdBQzFEMUIsRUFBUyxLQUFNMkIsTUFRckJyQyxxQ0FBcUN3QyxFQUFjOUIsR0FFakRaLFNBQVNrQyxpQkFBaUIsQ0FBQ0MsRUFBT2hCLEtBQ2hDLEdBQUlnQixFQUNGdkIsRUFBU3VCLEVBQU8sVUFDWCxDQUVMLE1BQU1JLEVBQVVwQixFQUFZcUIsT0FBT0gsR0FBS0EsRUFBRUssY0FBZ0JBLEdBQzFEOUIsRUFBUyxLQUFNMkIsTUFRckJyQywrQ0FBK0NvQyxFQUFTSSxFQUFjOUIsR0FFcEVaLFNBQVNrQyxpQkFBaUIsQ0FBQ0MsRUFBT2hCLEtBQ2hDLEdBQUlnQixFQUNGdkIsRUFBU3VCLEVBQU8sVUFDWCxDQUNMLElBQUlJLEVBQVVwQixFQUNDLE9BQVhtQixJQUNGQyxFQUFVQSxFQUFRQyxPQUFPSCxHQUFLQSxFQUFFSSxjQUFnQkgsSUFHOUIsT0FBaEJJLElBQ0ZILEVBQVVBLEVBQVFDLE9BQU9ILEdBQUtBLEVBQUVLLGNBQWdCQSxJQUdsRDlCLEVBQVMsS0FBTTJCLE1BUXJCckMsMEJBQTBCVSxHQUV4QlosU0FBU2tDLGlCQUFpQixDQUFDQyxFQUFPaEIsS0FDaEMsR0FBSWdCLEVBQ0Z2QixFQUFTdUIsRUFBTyxVQUNYLENBRUwsTUFBTVEsRUFBZ0J4QixFQUFZeUIsSUFBSSxDQUFDQyxFQUFHQyxJQUFNM0IsRUFBWTJCLEdBQUdKLGNBR3pESyxFQUFzQkosRUFBY0gsT0FBTyxDQUFDSyxFQUFHQyxJQUFNSCxFQUFjSyxRQUFRSCxJQUFNQyxHQUN2RmxDLEVBQVMsS0FBTW1DLE1BUXJCN0MscUJBQXFCVSxHQUVuQlosU0FBU2tDLGlCQUFpQixDQUFDQyxFQUFPaEIsS0FDaEMsR0FBSWdCLEVBQ0Z2QixFQUFTdUIsRUFBTyxVQUNYLENBRUwsTUFBTWMsRUFBVzlCLEVBQVl5QixJQUFJLENBQUNDLEVBQUdDLElBQU0zQixFQUFZMkIsR0FBR0wsY0FHcERTLEVBQWlCRCxFQUFTVCxPQUFPLENBQUNLLEVBQUdDLElBQU1HLEVBQVNELFFBQVFILElBQU1DLEdBQ3hFbEMsRUFBUyxLQUFNc0MsTUFRckJoRCx3QkFBd0J5QixHQUN0Qiw4QkFBZ0NBLEVBQVdNLEtBTTdDL0IsNkJBQTZCeUIsR0FDM0IsY0FBZ0JBLEVBQVd3QixrQkFNL0JqRCx1Q0FBdUN5QixHQU1uQyx5QkFDdUJBLEVBQVdNLDhDQUNaTixFQUFXTSw4Q0FDWE4sRUFBV00sOENBQ1hOLEVBQVdNLG1CQU1uQy9CLDhCQUE4QnlCLEVBQVlpQixHQVF4QyxPQVBlLElBQUlRLE9BQU9DLEtBQUtDLFFBQzdCQyxTQUFVNUIsRUFBVzZCLE9BQ3JCQyxNQUFPOUIsRUFBVytCLEtBQ2xCQyxJQUFLM0QsU0FBUzRELGlCQUFpQmpDLEdBQy9CaUIsSUFBS0EsRUFDTGlCLFVBQVdULE9BQU9DLEtBQUtTLFVBQVVDLFFDMU92QyxJQUFJcEMsV0FDSixJQUFJaUIsSUFNSixNQUFNb0IsZ0JBQ0xDLEVBQUcsZ0VBQ0hDLEVBQUcsNEJBQ0hDLEVBQUcsZ0RBQ0hDLEVBQUcsaURBQ0hDLEVBQUcsbUVBQ0hDLEVBQUcsNEVBQ0hDLEVBQUcsb0ZBQ0hDLEVBQUcsZ0VBQ0hDLEVBQUcsa0VBQ0hDLEdBQUksd0RBUUxDLE9BQU9DLFFBQVUsTUFDZkMsdUJBQXVCLENBQUMxQyxFQUFPUixLQUN6QlEsRUFDRk4sUUFBUU0sTUFBTUEsSUFFZDJDLEtBQUtsQyxJQUFNLElBQUlRLE9BQU9DLEtBQUswQixJQUFJQyxTQUFTQyxlQUFlLFFBQ3JEQyxLQUFNLEdBQ05DLE9BQVF4RCxFQUFXNkIsT0FDbkI0QixhQUFhLElBRWZDLGlCQUNBckYsU0FBU3NGLHVCQUF1QlIsS0FBS25ELFdBQVltRCxLQUFLbEMsVUFRNUQyQyxRQUNBUCxTQUFTQyxlQUFlLGFBQWFPLGlCQUFpQixRQUFTLFNBQVNDLEdBQ0wsVUFBNURULFNBQVNDLGVBQWUsaUJBQWlCUyxNQUFNQyxTQUNsRFgsU0FBU0MsZUFBZSxpQkFBaUJTLE1BQU1DLFFBQVUsT0FDekRoQixPQUFPQyxXQUVQSSxTQUFTQyxlQUFlLGlCQUFpQlMsTUFBTUMsUUFBVSxVQU03RGQsdUJBQTBCakUsQ0FBQUEsSUFDeEIsR0FBSWtFLEtBQUtuRCxXQUVQLFlBREFmLEVBQVMsS0FBTWtFLEtBQUtuRCxZQUd0QixNQUFNTSxFQUFLMkQsbUJBQW1CLE1BQ3pCM0QsRUFJSGpDLFNBQVM2RixvQkFBb0I1RCxFQUFJLENBQUNFLEVBQU9SLEtBQ3ZDbUQsS0FBS25ELFdBQWFBLEVBQ2JBLEdBSUxtRSxxQkFDQWxGLEVBQVMsS0FBTWUsSUFKYkUsUUFBUU0sTUFBTUEsTUFObEJBLE1BQVEsMEJBQ1J2QixFQUFTdUIsTUFBTyxTQWlCcEIyRCxtQkFBcUIsRUFBQ25FLEVBQWFtRCxLQUFLbkQsY0FDekJxRCxTQUFTQyxlQUFlLG1CQUNoQ2MsVUFBWXBFLEVBQVcrQixLQUVac0IsU0FBU0MsZUFBZSxzQkFDaENjLFVBQVlwRSxFQUFXcUUsUUFFL0IsTUFBTUMsRUFBUWpCLFNBQVNDLGVBQWUsa0JBQ3RDZ0IsRUFBTUMsVUFBWSxpQkFDbEJELEVBQU1FLElBQU1uRyxTQUFTb0csc0JBQXNCekUsR0FDNUNzRSxFQUFNSSxPQUFTckcsU0FBU3NHLGdDQUFnQzNFLEdBQ3ZEc0UsRUFBTU0sSUFBTXZDLGVBQWVyQyxFQUFXTSxJQUV0QitDLFNBQVNDLGVBQWUsc0JBQ2hDYyxVQUFZcEUsRUFBV2MsYUFHM0JkLEVBQVc2RSxpQkFDYkMsMEJBR0ZDLG9CQU1GRCx3QkFBMEIsRUFBQ0UsRUFBaUI3QixLQUFLbkQsV0FBVzZFLG1CQUMxRCxNQUFNSSxFQUFRNUIsU0FBU0MsZUFBZSxvQkFDdkMyQixFQUFNYixVQUFZLEdBQ2pCLElBQUssSUFBSWMsS0FBT0YsRUFBZ0IsQ0FDOUIsTUFBTUcsRUFBTTlCLFNBQVMrQixjQUFjLE1BRTdCQyxFQUFNaEMsU0FBUytCLGNBQWMsTUFDbkNDLEVBQUlqQixVQUFZYyxFQUNoQkMsRUFBSUcsWUFBWUQsR0FFaEIsTUFBTUUsRUFBT2xDLFNBQVMrQixjQUFjLE1BQ3BDRyxFQUFLbkIsVUFBWVksRUFBZUUsR0FDaENDLEVBQUlHLFlBQVlDLEdBRWhCTixFQUFNSyxZQUFZSCxNQU90QkosZ0JBQWtCLEVBQUNTLEVBQVVyQyxLQUFLbkQsV0FBV3dGLFdBQzNDLE1BQU1DLEVBQVlwQyxTQUFTQyxlQUFlLHFCQUMzQ21DLEVBQVVyQixVQUFZLDhCQUN0QixNQUFNdEMsRUFBUXVCLFNBQVMrQixjQUFjLE1BS3BDLEdBSkF0RCxFQUFNc0MsVUFBWSxVQUNsQnRDLEVBQU00RCxTQUFXLElBQ2pCRCxFQUFVSCxZQUFZeEQsSUFFakIwRCxFQUFTLENBQ1osTUFBTUcsRUFBWXRDLFNBQVMrQixjQUFjLEtBR3pDLE9BRkFPLEVBQVV2QixVQUFZLHVCQUN0QnFCLEVBQVVILFlBQVlLLEdBR3hCLE1BQU1DLEVBQUt2QyxTQUFTQyxlQUFlLGdCQUNuQ2tDLEVBQVF6RixRQUFROEYsSUFDZEQsRUFBR04sWUFBWVEsaUJBQWlCRCxNQUVsQ0osRUFBVUgsWUFBWU0sS0FNeEJFLGlCQUFvQkQsQ0FBQUEsSUFDbEIsTUFBTUUsRUFBSzFDLFNBQVMrQixjQUFjLE1BQ2xDVyxFQUFHTCxTQUFXLElBR2QsTUFBTU0sRUFBTzNDLFNBQVMrQixjQUFjLE1BQ3BDWSxFQUFLNUIsVUFBWXlCLEVBQU9HLEtBQ3hCRCxFQUFHVCxZQUFZVSxHQUVmLE1BQU1qRSxFQUFPc0IsU0FBUytCLGNBQWMsTUFDcENyRCxFQUFLcUMsVUFBWXlCLEVBQU85RCxLQUN4QmdFLEVBQUdULFlBQVl2RCxHQUVmLE1BQU1rRSxFQUFTNUMsU0FBUytCLGNBQWMsS0FDdENhLEVBQU83QixxQkFBdUJ5QixFQUFPSSxTQUNyQ0YsRUFBR1QsWUFBWVcsR0FFZixNQUFNQyxFQUFXN0MsU0FBUytCLGNBQWMsS0FJeEMsT0FIQWMsRUFBUzlCLFVBQVl5QixFQUFPSyxTQUM1QkgsRUFBR1QsWUFBWVksR0FFUkgsSUFNVHJDLGVBQWlCLEVBQUMxRCxFQUFXbUQsS0FBS25ELGNBQ2hDLE1BQU1tRyxFQUFhOUMsU0FBU0MsZUFBZSxjQUN0QzhDLEVBQXFCRCxFQUFXRSxpQkFBaUIsTUFDdkQsSUFBS0MsV0FBV0YsRUFDaEJFLFFBQVFDLGdCQUFnQixnQkFFeEIsTUFBTVIsRUFBSzFDLFNBQVMrQixjQUFjLE1BQ2xDVyxFQUFHUyxhQUFhLGVBQWdCLFFBQ0ssSUFBakNMLEVBQVdNLG9CQUNkVixFQUFHM0IsVUFBWXBFLEVBQVcrQixLQUMxQm9FLEVBQVdiLFlBQVlTLE1BTXpCOUIsbUJBQXFCLEVBQUNsQyxFQUFNQyxLQUNyQkEsSUFDSEEsRUFBTWdCLE9BQU8wRCxTQUFTQyxNQUN4QjVFLEVBQU9BLEVBQUs2RSxRQUFRLFVBQVcsUUFDL0IsTUFDRWhHLEVBRFksSUFBSWlHLGNBQWM5RSxzQkFDZCtFLEtBQUs5RSxHQUN2QixPQUFLcEIsRUFFQUEsRUFBUSxHQUVObUcsbUJBQW1CbkcsRUFBUSxHQUFHZ0csUUFBUSxNQUFPLE1BRDNDLEdBRkEsT0FNUHBJLFVBQVVDLGVBQ1pELFVBQVVDLGNBQWN1SSxTQUFTLFNBQzlCN0gsS0FBSyxJQUFNZSxRQUFRQyxJQUFJLGdCQy9NNUI4RyxzQkFBd0IsTUFFZnpJLFVBQVVDLGVBRWZELFVBQVVDLGNBQWN1SSxTQUFTLFVBQVU1RyxNQUFNLFdBQy9DRixRQUFRQyxJQUFJLDBEQUloQjhHIiwiZmlsZSI6ImFsbF9yZXN0YXVyYW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIENvbW1vbiBkYXRhYmFzZSBoZWxwZXIgZnVuY3Rpb25zLlxyXG4gKi9cclxuY2xhc3MgREJIZWxwZXIge1xyXG5cclxuICAvKipcclxuICAgKiBEYXRhYmFzZSBVUkwuXHJcbiAgICogQ2hhbmdlIHRoaXMgdG8gcmVzdGF1cmFudHMuanNvbiBmaWxlIGxvY2F0aW9uIG9uIHlvdXIgc2VydmVyLlxyXG4gICAqL1xyXG4gIHN0YXRpYyBnZXQgREFUQUJBU0VfVVJMKCkge1xyXG4gICAgY29uc3QgcG9ydCA9IDEzMzc7XHJcbiAgICByZXR1cm4gYGh0dHA6Ly9sb2NhbGhvc3Q6JHtwb3J0fS9yZXN0YXVyYW50c2A7XHJcbiAgfVxyXG5cclxuXHJcbiAgIC8vIElEQiBjcmVhdGlvblxyXG5cclxuXHJcbiAgc3RhdGljIG9wZW5EYXRhYmFzZSAoKSB7XHJcblxyXG4gICAgaWYgKCFuYXZpZ2F0b3Iuc2VydmljZVdvcmtlcikge1xyXG4gICAgICAvL2NvbnNvbGUubG9nKGBTZXJ2aWNlIFdvcmtlcnMgaXMgbm90IHN1cHBvcnRlZCBieSBicm93c2Vyc2ApO1xyXG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGlkYi5vcGVuKCdyZXN0YXVyYW50LWRiJywgMSwgZnVuY3Rpb24gKHVwZ3JhZGVEYikge1xyXG4gICAgICB2YXIgc3RvcmUgPSB1cGdyYWRlRGIuY3JlYXRlT2JqZWN0U3RvcmUoJ3Jlc3RhdXJhbnRzJywge1xyXG4gICAgICAgIGtleVBhdGg6ICdpZCcsXHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBGZXRjaCBhbGwgcmVzdGF1cmFudHMuXHJcbiAgICovXHJcbiAgc3RhdGljIGZldGNoUmVzdGF1cmFudHMoY2FsbGJhY2spIHtcclxuXHJcbiAgICAvLyBnZXQgcmVzdGF1cmFudHMgZnJvbSBpbmRleGVkREJcclxuICAgIERCSGVscGVyLm9wZW5EYXRhYmFzZSgpLnRoZW4oZnVuY3Rpb24gKGRiKSB7XHJcbiAgICAgIGlmICghZGIpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH0gIGVsc2Uge1xyXG4gICAgICAgIHJldHVybiBkYi50cmFuc2FjdGlvbigncmVzdGF1cmFudHMnLCAncmVhZHdyaXRlJylcclxuICAgICAgICAgICAgICAgICAub2JqZWN0U3RvcmUoJ3Jlc3RhdXJhbnRzJylcclxuICAgICAgICAgICAgICAgICAuZ2V0QWxsKCk7XHJcbiAgICAgIH1cclxuICAgIH0pLnRoZW4oZnVuY3Rpb24gKHJlc3RhdXJhbnRzKSB7XHJcbiAgICAgIGlmIChyZXN0YXVyYW50cy5sZW5ndGggPT09IDApIHJldHVybjtcclxuICAgICAgY2FsbGJhY2sobnVsbCwgcmVzdGF1cmFudHMpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgZmV0Y2goREJIZWxwZXIuREFUQUJBU0VfVVJMKVxyXG4gICAgLnRoZW4oXHJcbiAgICAgIGZ1bmN0aW9uIChyZXNwb25zZSkge1xyXG4gICAgICAgIGlmIChyZXNwb25zZS5zdGF0dXMgIT09IDIwMCkge1xyXG4gICAgICAgICAgY29uc29sZS5sb2coJ0ZldGNoIElzc3VlIC0gU3RhdHVzIENvZGU6ICcgKyByZXNwb25zZS5zdGF0dXMpO1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmVzcG9uc2UuanNvbigpLnRoZW4oZnVuY3Rpb24gKHJlc3RhdXJhbnRzKSB7XHJcblxyXG4gICAgICAgICAgLyogQWRkIHJlc3RhdXJhbnRzIHRvIGluZGV4ZWREQiAqL1xyXG4gICAgICAgICAgREJIZWxwZXIub3BlbkRhdGFiYXNlKCkudGhlbihmdW5jdGlvbiAoZGIpIHtcclxuICAgICAgICAgICAgaWYgKCFkYikge1xyXG4gICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICBsZXQgc3RvcmUgPSBkYi50cmFuc2FjdGlvbigncmVzdGF1cmFudHMnLCAncmVhZHdyaXRlJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5vYmplY3RTdG9yZSgncmVzdGF1cmFudHMnKTtcclxuICAgICAgICAgICAgICByZXN0YXVyYW50cy5mb3JFYWNoKGZ1bmN0aW9uIChyZXN0YXVyYW50KSB7XHJcbiAgICAgICAgICAgICAgICBzdG9yZS5wdXQocmVzdGF1cmFudCk7XHJcbiAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgIGNhbGxiYWNrKG51bGwsIHJlc3RhdXJhbnRzKTtcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgKVxyXG4gICAgLmNhdGNoKGZ1bmN0aW9uIChlcnIpIHtcclxuICAgICAgY29uc29sZS5sb2coJ0ZldGNoIEVycm9yOiAnLCBlcnIpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBGZXRjaCBhIHJlc3RhdXJhbnQgYnkgaXRzIElELlxyXG4gICAqL1xyXG4gIHN0YXRpYyBmZXRjaFJlc3RhdXJhbnRCeUlkKGlkLCBjYWxsYmFjaykge1xyXG4gICAgLy8gZmV0Y2ggYWxsIHJlc3RhdXJhbnRzIHdpdGggcHJvcGVyIGVycm9yIGhhbmRsaW5nLlxyXG4gICAgREJIZWxwZXIuZmV0Y2hSZXN0YXVyYW50cygoZXJyb3IsIHJlc3RhdXJhbnRzKSA9PiB7XHJcbiAgICAgIGlmIChlcnJvcikge1xyXG4gICAgICAgIGNhbGxiYWNrKGVycm9yLCBudWxsKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBjb25zdCByZXN0YXVyYW50ID0gcmVzdGF1cmFudHMuZmluZChyID0+IHIuaWQgPT0gaWQpO1xyXG4gICAgICAgIGlmIChyZXN0YXVyYW50KSB7IC8vIEdvdCB0aGUgcmVzdGF1cmFudFxyXG4gICAgICAgICAgY2FsbGJhY2sobnVsbCwgcmVzdGF1cmFudCk7XHJcbiAgICAgICAgfSBlbHNlIHsgLy8gUmVzdGF1cmFudCBkb2VzIG5vdCBleGlzdCBpbiB0aGUgZGF0YWJhc2VcclxuICAgICAgICAgIGNhbGxiYWNrKCdSZXN0YXVyYW50IGRvZXMgbm90IGV4aXN0JywgbnVsbCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEZldGNoIHJlc3RhdXJhbnRzIGJ5IGEgY3Vpc2luZSB0eXBlIHdpdGggcHJvcGVyIGVycm9yIGhhbmRsaW5nLlxyXG4gICAqL1xyXG4gIHN0YXRpYyBmZXRjaFJlc3RhdXJhbnRCeUN1aXNpbmUoY3Vpc2luZSwgY2FsbGJhY2spIHtcclxuICAgIC8vIEZldGNoIGFsbCByZXN0YXVyYW50cyAgd2l0aCBwcm9wZXIgZXJyb3IgaGFuZGxpbmdcclxuICAgIERCSGVscGVyLmZldGNoUmVzdGF1cmFudHMoKGVycm9yLCByZXN0YXVyYW50cykgPT4ge1xyXG4gICAgICBpZiAoZXJyb3IpIHtcclxuICAgICAgICBjYWxsYmFjayhlcnJvciwgbnVsbCk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gRmlsdGVyIHJlc3RhdXJhbnRzIHRvIGhhdmUgb25seSBnaXZlbiBjdWlzaW5lIHR5cGVcclxuICAgICAgICBjb25zdCByZXN1bHRzID0gcmVzdGF1cmFudHMuZmlsdGVyKHIgPT4gci5jdWlzaW5lX3R5cGUgPT0gY3Vpc2luZSk7XHJcbiAgICAgICAgY2FsbGJhY2sobnVsbCwgcmVzdWx0cyk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRmV0Y2ggcmVzdGF1cmFudHMgYnkgYSBuZWlnaGJvcmhvb2Qgd2l0aCBwcm9wZXIgZXJyb3IgaGFuZGxpbmcuXHJcbiAgICovXHJcbiAgc3RhdGljIGZldGNoUmVzdGF1cmFudEJ5TmVpZ2hib3Job29kKG5laWdoYm9yaG9vZCwgY2FsbGJhY2spIHtcclxuICAgIC8vIEZldGNoIGFsbCByZXN0YXVyYW50c1xyXG4gICAgREJIZWxwZXIuZmV0Y2hSZXN0YXVyYW50cygoZXJyb3IsIHJlc3RhdXJhbnRzKSA9PiB7XHJcbiAgICAgIGlmIChlcnJvcikge1xyXG4gICAgICAgIGNhbGxiYWNrKGVycm9yLCBudWxsKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICAvLyBGaWx0ZXIgcmVzdGF1cmFudHMgdG8gaGF2ZSBvbmx5IGdpdmVuIG5laWdoYm9yaG9vZFxyXG4gICAgICAgIGNvbnN0IHJlc3VsdHMgPSByZXN0YXVyYW50cy5maWx0ZXIociA9PiByLm5laWdoYm9yaG9vZCA9PSBuZWlnaGJvcmhvb2QpO1xyXG4gICAgICAgIGNhbGxiYWNrKG51bGwsIHJlc3VsdHMpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEZldGNoIHJlc3RhdXJhbnRzIGJ5IGEgY3Vpc2luZSBhbmQgYSBuZWlnaGJvcmhvb2Qgd2l0aCBwcm9wZXIgZXJyb3IgaGFuZGxpbmcuXHJcbiAgICovXHJcbiAgc3RhdGljIGZldGNoUmVzdGF1cmFudEJ5Q3Vpc2luZUFuZE5laWdoYm9yaG9vZChjdWlzaW5lLCBuZWlnaGJvcmhvb2QsIGNhbGxiYWNrKSB7XHJcbiAgICAvLyBGZXRjaCBhbGwgcmVzdGF1cmFudHNcclxuICAgIERCSGVscGVyLmZldGNoUmVzdGF1cmFudHMoKGVycm9yLCByZXN0YXVyYW50cykgPT4ge1xyXG4gICAgICBpZiAoZXJyb3IpIHtcclxuICAgICAgICBjYWxsYmFjayhlcnJvciwgbnVsbCk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgbGV0IHJlc3VsdHMgPSByZXN0YXVyYW50cztcclxuICAgICAgICBpZiAoY3Vpc2luZSAhPSAnYWxsJykgeyAvLyBmaWx0ZXIgYnkgY3Vpc2luZVxyXG4gICAgICAgICAgcmVzdWx0cyA9IHJlc3VsdHMuZmlsdGVyKHIgPT4gci5jdWlzaW5lX3R5cGUgPT0gY3Vpc2luZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAobmVpZ2hib3Job29kICE9ICdhbGwnKSB7IC8vIGZpbHRlciBieSBuZWlnaGJvcmhvb2RcclxuICAgICAgICAgIHJlc3VsdHMgPSByZXN1bHRzLmZpbHRlcihyID0+IHIubmVpZ2hib3Job29kID09IG5laWdoYm9yaG9vZCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjYWxsYmFjayhudWxsLCByZXN1bHRzKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBGZXRjaCBhbGwgbmVpZ2hib3Job29kcyB3aXRoIHByb3BlciBlcnJvciBoYW5kbGluZy5cclxuICAgKi9cclxuICBzdGF0aWMgZmV0Y2hOZWlnaGJvcmhvb2RzKGNhbGxiYWNrKSB7XHJcbiAgICAvLyBGZXRjaCBhbGwgcmVzdGF1cmFudHNcclxuICAgIERCSGVscGVyLmZldGNoUmVzdGF1cmFudHMoKGVycm9yLCByZXN0YXVyYW50cykgPT4ge1xyXG4gICAgICBpZiAoZXJyb3IpIHtcclxuICAgICAgICBjYWxsYmFjayhlcnJvciwgbnVsbCk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gR2V0IGFsbCBuZWlnaGJvcmhvb2RzIGZyb20gYWxsIHJlc3RhdXJhbnRzXHJcbiAgICAgICAgY29uc3QgbmVpZ2hib3Job29kcyA9IHJlc3RhdXJhbnRzLm1hcCgodiwgaSkgPT4gcmVzdGF1cmFudHNbaV0ubmVpZ2hib3Job29kKTtcclxuXHJcbiAgICAgICAgLy8gUmVtb3ZlIGR1cGxpY2F0ZXMgZnJvbSBuZWlnaGJvcmhvb2RzXHJcbiAgICAgICAgY29uc3QgdW5pcXVlTmVpZ2hib3Job29kcyA9IG5laWdoYm9yaG9vZHMuZmlsdGVyKCh2LCBpKSA9PiBuZWlnaGJvcmhvb2RzLmluZGV4T2YodikgPT0gaSk7XHJcbiAgICAgICAgY2FsbGJhY2sobnVsbCwgdW5pcXVlTmVpZ2hib3Job29kcyk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRmV0Y2ggYWxsIGN1aXNpbmVzIHdpdGggcHJvcGVyIGVycm9yIGhhbmRsaW5nLlxyXG4gICAqL1xyXG4gIHN0YXRpYyBmZXRjaEN1aXNpbmVzKGNhbGxiYWNrKSB7XHJcbiAgICAvLyBGZXRjaCBhbGwgcmVzdGF1cmFudHNcclxuICAgIERCSGVscGVyLmZldGNoUmVzdGF1cmFudHMoKGVycm9yLCByZXN0YXVyYW50cykgPT4ge1xyXG4gICAgICBpZiAoZXJyb3IpIHtcclxuICAgICAgICBjYWxsYmFjayhlcnJvciwgbnVsbCk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gR2V0IGFsbCBjdWlzaW5lcyBmcm9tIGFsbCByZXN0YXVyYW50c1xyXG4gICAgICAgIGNvbnN0IGN1aXNpbmVzID0gcmVzdGF1cmFudHMubWFwKCh2LCBpKSA9PiByZXN0YXVyYW50c1tpXS5jdWlzaW5lX3R5cGUpO1xyXG5cclxuICAgICAgICAvLyBSZW1vdmUgZHVwbGljYXRlcyBmcm9tIGN1aXNpbmVzXHJcbiAgICAgICAgY29uc3QgdW5pcXVlQ3Vpc2luZXMgPSBjdWlzaW5lcy5maWx0ZXIoKHYsIGkpID0+IGN1aXNpbmVzLmluZGV4T2YodikgPT0gaSk7XHJcbiAgICAgICAgY2FsbGJhY2sobnVsbCwgdW5pcXVlQ3Vpc2luZXMpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlc3RhdXJhbnQgcGFnZSBVUkwuXHJcbiAgICovXHJcbiAgc3RhdGljIHVybEZvclJlc3RhdXJhbnQocmVzdGF1cmFudCkge1xyXG4gICAgcmV0dXJuIChgLi9yZXN0YXVyYW50Lmh0bWw/aWQ9JHtyZXN0YXVyYW50LmlkfWApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVzdGF1cmFudCBpbWFnZSBVUkwuXHJcbiAgICovXHJcbiAgc3RhdGljIGltYWdlVXJsRm9yUmVzdGF1cmFudChyZXN0YXVyYW50KSB7XHJcbiAgICByZXR1cm4gKGAvaW1nLyR7cmVzdGF1cmFudC5waG90b2dyYXBofS53ZWJwYCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICogUmVzdGF1cmFudCByZXNwb25zaXZlIGltYWdlcyBzb3VyY2Ugc2V0LlxyXG4gKi9cclxuc3RhdGljIGltYWdlUmVzcG9uc2l2ZVVybEZvclJlc3RhdXJhbnQocmVzdGF1cmFudCkge1xyXG4gICAgY29uc3Qgc2NhbGUxeCA9ICczMjAnO1xyXG4gICAgY29uc3Qgc2NhbGUxXzV4ID0gJzQ4MCc7XHJcbiAgICBjb25zdCBzY2FsZTJ4ID0gJzY0MCc7XHJcbiAgICBjb25zdCBzY2FsZTN4ID0gJzgwMCc7XHJcblxyXG4gICAgcmV0dXJuIChcclxuICAgICAgICBgL2ltZ19yZXNwb25zaXZlLyR7cmVzdGF1cmFudC5pZH0tJHtzY2FsZTF4fS53ZWJwICR7c2NhbGUxeH13LFxyXG4gICAgICAgIC9pbWdfcmVzcG9uc2l2ZS8ke3Jlc3RhdXJhbnQuaWR9LSR7c2NhbGUxXzV4fS53ZWJwICR7c2NhbGUxXzV4fXcsXHJcbiAgICAgICAgL2ltZ19yZXNwb25zaXZlLyR7cmVzdGF1cmFudC5pZH0tJHtzY2FsZTJ4fS53ZWJwICR7c2NhbGUyeH13LFxyXG4gICAgICAgIC9pbWdfcmVzcG9uc2l2ZS8ke3Jlc3RhdXJhbnQuaWR9LSR7c2NhbGUzeH0ud2VicCAke3NjYWxlM3h9d2ApO1xyXG59XHJcblxyXG4gIC8qKlxyXG4gICAqIE1hcCBtYXJrZXIgZm9yIGEgcmVzdGF1cmFudC5cclxuICAgKi9cclxuICBzdGF0aWMgbWFwTWFya2VyRm9yUmVzdGF1cmFudChyZXN0YXVyYW50LCBtYXApIHtcclxuICAgIGNvbnN0IG1hcmtlciA9IG5ldyBnb29nbGUubWFwcy5NYXJrZXIoe1xyXG4gICAgICBwb3NpdGlvbjogcmVzdGF1cmFudC5sYXRsbmcsXHJcbiAgICAgIHRpdGxlOiByZXN0YXVyYW50Lm5hbWUsXHJcbiAgICAgIHVybDogREJIZWxwZXIudXJsRm9yUmVzdGF1cmFudChyZXN0YXVyYW50KSxcclxuICAgICAgbWFwOiBtYXAsXHJcbiAgICAgIGFuaW1hdGlvbjogZ29vZ2xlLm1hcHMuQW5pbWF0aW9uLkRST1AsXHJcbiAgICB9KTtcclxuICAgIHJldHVybiBtYXJrZXI7XHJcbiAgfVxyXG5cclxufVxyXG4iLCJsZXQgcmVzdGF1cmFudDtcclxudmFyIG1hcDtcclxuXHJcblxyXG4vKlxyXG5TZXR0aW5nIHBob3RvZ3JhcGhzIGFsdHMqL1xyXG5cclxuY29uc3QgcGhvdG9ncmFwaEFsdHMgPSB7XHJcblx0MTogXCJTZXJldmFsIGdyb3VwcyBvZiBwZW9wbGUgaGF2aW5nIHF1YWxpdHkgdGltZSBhdCBhIHJlc3RhdXJhbnQuXCIsXHJcblx0MjogXCJBIGxvdmVseSBtYXJnZXJpdHRhIHBpenphXCIsXHJcblx0MzogXCJBbiBlbXB0eSByZXN0YXVyYW50IHNldHRpbmcgd2hpY2ggaGFzIGhlYXRlcnNcIixcclxuXHQ0OiBcIkEgY29ybmVyIHNob3Qgb2YgdGhlIG91dHNpZGUgb2YgdGhlIHJlc3RhdXJhdC5cIixcclxuXHQ1OiBcIkEgY3Jvd2RlZCByZXN0YXVyYW50IGFuZCBzdGFmZiBzZXJ2aW5nIGZvb2QgZnJvbSBiZWhpbmQgdGhlIGJhci5cIixcclxuXHQ2OiBcIlJlc3RhdXJhbnQgd2l0aCB3b29kZW4gdGFibGVzLCBjaGFyaXMsIGFuZCBhIFVTIGZsYWcgYXMgYSB3YWxsIGRlY29yYXRpb25cIixcclxuXHQ3OiBcImEgZG9nIHdhdGNoaW5nIGZyb20gdGhlIG91dHNpZGUgb2YgYSBjcm93ZGVkIGJ1cmdlciBzaG9wLCBhY2NvbXBhbmllZCBieSB0d28gbWVuLlwiLFxyXG5cdDg6IFwiQ2xvc2UgdXAgb2YgdGhlIGR1dGNoIHJlc3RhdXJhbnQgbG9nbyBiZXNpZGUgYSBmbG93ZXJpbmcgdHJlZVwiLFxyXG5cdDk6IFwiQmxhY2sgYW5kIHdoaXRlIHBpY3R1cmUgb2YgcGVvcGxlIGVhdGluZyBhdCBhbiBhc2lhbiByZXN0YXVyYXQuXCIsXHJcblx0MTA6IFwiRW1wdHkgcmVzdGF1cmFudCdzIHdoaXRlIGNoYWlycywgd2FsbHMgYW5kIGNlaWxpbmdzLlwiXHJcbn07XHJcblxyXG5cclxuXHJcbi8qKlxyXG4gKiBJbml0aWFsaXplIEdvb2dsZSBtYXAsIGNhbGxlZCBmcm9tIEhUTUwuXHJcbiAqL1xyXG53aW5kb3cuaW5pdE1hcCA9ICgpID0+IHtcclxuICBmZXRjaFJlc3RhdXJhbnRGcm9tVVJMKChlcnJvciwgcmVzdGF1cmFudCkgPT4ge1xyXG4gICAgaWYgKGVycm9yKSB7IC8vIEdvdCBhbiBlcnJvciFcclxuICAgICAgY29uc29sZS5lcnJvcihlcnJvcik7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBzZWxmLm1hcCA9IG5ldyBnb29nbGUubWFwcy5NYXAoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21hcCcpLCB7XHJcbiAgICAgICAgem9vbTogMTYsXHJcbiAgICAgICAgY2VudGVyOiByZXN0YXVyYW50LmxhdGxuZyxcclxuICAgICAgICBzY3JvbGx3aGVlbDogZmFsc2VcclxuICAgICAgfSk7XHJcbiAgICAgIGZpbGxCcmVhZGNydW1iKCk7XHJcbiAgICAgIERCSGVscGVyLm1hcE1hcmtlckZvclJlc3RhdXJhbnQoc2VsZi5yZXN0YXVyYW50LCBzZWxmLm1hcCk7XHJcbiAgICB9XHJcbiAgfSk7XHJcbn1cclxuXHJcbi8qKlxyXG5TaG93IG1hcCBidXR0b25cclxuKi9cclxuY2FsbE1hcCA9XHJcbmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtYXBUb2dnbGUnKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgaWYgKChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWFwLWNvbnRhaW5lcicpLnN0eWxlLmRpc3BsYXkpID09PSAnYmxvY2snKSB7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWFwLWNvbnRhaW5lcicpLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICB3aW5kb3cuaW5pdE1hcCgpO1xyXG4gIH0gZWxzZSB7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWFwLWNvbnRhaW5lcicpLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xyXG4gIH1cclxufSk7XHJcbi8qKlxyXG4gKiBHZXQgY3VycmVudCByZXN0YXVyYW50IGZyb20gcGFnZSBVUkwuXHJcbiAqL1xyXG5mZXRjaFJlc3RhdXJhbnRGcm9tVVJMID0gKGNhbGxiYWNrKSA9PiB7XHJcbiAgaWYgKHNlbGYucmVzdGF1cmFudCkgeyAvLyByZXN0YXVyYW50IGFscmVhZHkgZmV0Y2hlZCFcclxuICAgIGNhbGxiYWNrKG51bGwsIHNlbGYucmVzdGF1cmFudClcclxuICAgIHJldHVybjtcclxuICB9XHJcbiAgY29uc3QgaWQgPSBnZXRQYXJhbWV0ZXJCeU5hbWUoJ2lkJyk7XHJcbiAgaWYgKCFpZCkgeyAvLyBubyBpZCBmb3VuZCBpbiBVUkxcclxuICAgIGVycm9yID0gJ05vIHJlc3RhdXJhbnQgaWQgaW4gVVJMJ1xyXG4gICAgY2FsbGJhY2soZXJyb3IsIG51bGwpO1xyXG4gIH0gZWxzZSB7XHJcbiAgICBEQkhlbHBlci5mZXRjaFJlc3RhdXJhbnRCeUlkKGlkLCAoZXJyb3IsIHJlc3RhdXJhbnQpID0+IHtcclxuICAgICAgc2VsZi5yZXN0YXVyYW50ID0gcmVzdGF1cmFudDtcclxuICAgICAgaWYgKCFyZXN0YXVyYW50KSB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcihlcnJvcik7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcbiAgICAgIGZpbGxSZXN0YXVyYW50SFRNTCgpO1xyXG4gICAgICBjYWxsYmFjayhudWxsLCByZXN0YXVyYW50KVxyXG4gICAgfSk7XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogQ3JlYXRlIHJlc3RhdXJhbnQgSFRNTCBhbmQgYWRkIGl0IHRvIHRoZSB3ZWJwYWdlXHJcbiAqL1xyXG5maWxsUmVzdGF1cmFudEhUTUwgPSAocmVzdGF1cmFudCA9IHNlbGYucmVzdGF1cmFudCkgPT4ge1xyXG4gIGNvbnN0IG5hbWUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmVzdGF1cmFudC1uYW1lJyk7XHJcbiAgbmFtZS5pbm5lckhUTUwgPSByZXN0YXVyYW50Lm5hbWU7XHJcblxyXG4gIGNvbnN0IGFkZHJlc3MgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmVzdGF1cmFudC1hZGRyZXNzJyk7XHJcbiAgYWRkcmVzcy5pbm5lckhUTUwgPSByZXN0YXVyYW50LmFkZHJlc3M7XHJcblxyXG4gIGNvbnN0IGltYWdlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Jlc3RhdXJhbnQtaW1nJyk7XHJcbiAgaW1hZ2UuY2xhc3NOYW1lID0gJ3Jlc3RhdXJhbnQtaW1nJ1xyXG4gIGltYWdlLnNyYyA9IERCSGVscGVyLmltYWdlVXJsRm9yUmVzdGF1cmFudChyZXN0YXVyYW50KTtcclxuXHRpbWFnZS5zcmNzZXQgPSBEQkhlbHBlci5pbWFnZVJlc3BvbnNpdmVVcmxGb3JSZXN0YXVyYW50KHJlc3RhdXJhbnQpO1xyXG4gIGltYWdlLmFsdCA9IHBob3RvZ3JhcGhBbHRzW3Jlc3RhdXJhbnQuaWRdO1xyXG5cclxuICBjb25zdCBjdWlzaW5lID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Jlc3RhdXJhbnQtY3Vpc2luZScpO1xyXG4gIGN1aXNpbmUuaW5uZXJIVE1MID0gcmVzdGF1cmFudC5jdWlzaW5lX3R5cGU7XHJcblxyXG4gIC8vIGZpbGwgb3BlcmF0aW5nIGhvdXJzXHJcbiAgaWYgKHJlc3RhdXJhbnQub3BlcmF0aW5nX2hvdXJzKSB7XHJcbiAgICBmaWxsUmVzdGF1cmFudEhvdXJzSFRNTCgpO1xyXG4gIH1cclxuICAvLyBmaWxsIHJldmlld3NcclxuICBmaWxsUmV2aWV3c0hUTUwoKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIENyZWF0ZSByZXN0YXVyYW50IG9wZXJhdGluZyBob3VycyBIVE1MIHRhYmxlIGFuZCBhZGQgaXQgdG8gdGhlIHdlYnBhZ2UuXHJcbiAqL1xyXG5maWxsUmVzdGF1cmFudEhvdXJzSFRNTCA9IChvcGVyYXRpbmdIb3VycyA9IHNlbGYucmVzdGF1cmFudC5vcGVyYXRpbmdfaG91cnMpID0+IHtcclxuICBjb25zdCBob3VycyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZXN0YXVyYW50LWhvdXJzJyk7XHJcblx0aG91cnMuaW5uZXJIVE1MID0gJyc7XHJcbiAgZm9yIChsZXQga2V5IGluIG9wZXJhdGluZ0hvdXJzKSB7XHJcbiAgICBjb25zdCByb3cgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0cicpO1xyXG5cclxuICAgIGNvbnN0IGRheSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RkJyk7XHJcbiAgICBkYXkuaW5uZXJIVE1MID0ga2V5O1xyXG4gICAgcm93LmFwcGVuZENoaWxkKGRheSk7XHJcblxyXG4gICAgY29uc3QgdGltZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RkJyk7XHJcbiAgICB0aW1lLmlubmVySFRNTCA9IG9wZXJhdGluZ0hvdXJzW2tleV07XHJcbiAgICByb3cuYXBwZW5kQ2hpbGQodGltZSk7XHJcblxyXG4gICAgaG91cnMuYXBwZW5kQ2hpbGQocm93KTtcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDcmVhdGUgYWxsIHJldmlld3MgSFRNTCBhbmQgYWRkIHRoZW0gdG8gdGhlIHdlYnBhZ2UuXHJcbiAqL1xyXG5maWxsUmV2aWV3c0hUTUwgPSAocmV2aWV3cyA9IHNlbGYucmVzdGF1cmFudC5yZXZpZXdzKSA9PiB7XHJcbiAgY29uc3QgY29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Jldmlld3MtY29udGFpbmVyJyk7XHJcblx0Y29udGFpbmVyLmlubmVySFRNTCA9ICc8dWwgaWQ9XCJyZXZpZXdzLWxpc3RcIj48L3VsPic7XHJcblx0Y29uc3QgdGl0bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdoMicpO1xyXG4gIHRpdGxlLmlubmVySFRNTCA9ICdSZXZpZXdzJztcclxuICB0aXRsZS50YWJJbmRleCA9ICcwJztcclxuICBjb250YWluZXIuYXBwZW5kQ2hpbGQodGl0bGUpO1xyXG5cclxuICBpZiAoIXJldmlld3MpIHtcclxuICAgIGNvbnN0IG5vUmV2aWV3cyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3AnKTtcclxuICAgIG5vUmV2aWV3cy5pbm5lckhUTUwgPSAnTm8gcmV2aWV3cyB5ZXQhJztcclxuICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChub1Jldmlld3MpO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuICBjb25zdCB1bCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZXZpZXdzLWxpc3QnKTtcclxuICByZXZpZXdzLmZvckVhY2gocmV2aWV3ID0+IHtcclxuICAgIHVsLmFwcGVuZENoaWxkKGNyZWF0ZVJldmlld0hUTUwocmV2aWV3KSk7XHJcbiAgfSk7XHJcbiAgY29udGFpbmVyLmFwcGVuZENoaWxkKHVsKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIENyZWF0ZSByZXZpZXcgSFRNTCBhbmQgYWRkIGl0IHRvIHRoZSB3ZWJwYWdlLlxyXG4gKi9cclxuY3JlYXRlUmV2aWV3SFRNTCA9IChyZXZpZXcpID0+IHtcclxuICBjb25zdCBsaSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpJyk7XHJcbiAgbGkudGFiSW5kZXggPSAnMCc7XHJcblxyXG5cclxuICBjb25zdCBkYXRlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaDUnKTtcclxuICBkYXRlLmlubmVySFRNTCA9IHJldmlldy5kYXRlO1xyXG4gIGxpLmFwcGVuZENoaWxkKGRhdGUpO1xyXG5cclxuICBjb25zdCBuYW1lID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaDEnKTtcclxuICBuYW1lLmlubmVySFRNTCA9IHJldmlldy5uYW1lO1xyXG4gIGxpLmFwcGVuZENoaWxkKG5hbWUpO1xyXG5cclxuICBjb25zdCByYXRpbmcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpJyk7XHJcbiAgcmF0aW5nLmlubmVySFRNTCA9IGBSYXRpbmc6ICR7cmV2aWV3LnJhdGluZ31gO1xyXG4gIGxpLmFwcGVuZENoaWxkKHJhdGluZyk7XHJcblxyXG4gIGNvbnN0IGNvbW1lbnRzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncCcpO1xyXG4gIGNvbW1lbnRzLmlubmVySFRNTCA9IHJldmlldy5jb21tZW50cztcclxuICBsaS5hcHBlbmRDaGlsZChjb21tZW50cyk7XHJcblxyXG4gIHJldHVybiBsaTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEFkZCByZXN0YXVyYW50IG5hbWUgdG8gdGhlIGJyZWFkY3J1bWIgbmF2aWdhdGlvbiBtZW51XHJcbiAqL1xyXG5maWxsQnJlYWRjcnVtYiA9IChyZXN0YXVyYW50PXNlbGYucmVzdGF1cmFudCkgPT4ge1xyXG4gIGNvbnN0IGJyZWFkY3J1bWIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnJlYWRjcnVtYicpO1xyXG5cdGNvbnN0IGJyZWFkY3J1bWJFbGVtZW50cyA9IGJyZWFkY3J1bWIucXVlcnlTZWxlY3RvckFsbCgnbGknKTtcclxuXHRmb3IgKGVsZW1lbnQgb2YgYnJlYWRjcnVtYkVsZW1lbnRzKSB7XHJcblx0ZWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUoJ2FyaWEtY3VycmVudCcpO1xyXG59XHJcblx0Y29uc3QgbGkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaScpO1xyXG5cdGxpLnNldEF0dHJpYnV0ZSgnYXJpYS1jdXJyZW50JywgJ3BhZ2UnKTtcclxuXHRpZiAoYnJlYWRjcnVtYi5jaGlsZEVsZW1lbnRDb3VudCA9PT0gMikgcmV0dXJuO1xyXG4gIGxpLmlubmVySFRNTCA9IHJlc3RhdXJhbnQubmFtZTtcclxuICBicmVhZGNydW1iLmFwcGVuZENoaWxkKGxpKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEdldCBhIHBhcmFtZXRlciBieSBuYW1lIGZyb20gcGFnZSBVUkwuXHJcbiAqL1xyXG5nZXRQYXJhbWV0ZXJCeU5hbWUgPSAobmFtZSwgdXJsKSA9PiB7XHJcbiAgaWYgKCF1cmwpXHJcbiAgICB1cmwgPSB3aW5kb3cubG9jYXRpb24uaHJlZjtcclxuICBuYW1lID0gbmFtZS5yZXBsYWNlKC9bXFxbXFxdXS9nLCAnXFxcXCQmJyk7XHJcbiAgY29uc3QgcmVnZXggPSBuZXcgUmVnRXhwKGBbPyZdJHtuYW1lfSg9KFteJiNdKil8JnwjfCQpYCksXHJcbiAgICByZXN1bHRzID0gcmVnZXguZXhlYyh1cmwpO1xyXG4gIGlmICghcmVzdWx0cylcclxuICAgIHJldHVybiBudWxsO1xyXG4gIGlmICghcmVzdWx0c1syXSlcclxuICAgIHJldHVybiAnJztcclxuICByZXR1cm4gZGVjb2RlVVJJQ29tcG9uZW50KHJlc3VsdHNbMl0ucmVwbGFjZSgvXFwrL2csICcgJykpO1xyXG59XHJcblxyXG5pZiAobmF2aWdhdG9yLnNlcnZpY2VXb3JrZXIpIHtcclxuICBuYXZpZ2F0b3Iuc2VydmljZVdvcmtlci5yZWdpc3Rlcignc3cuanMnKVxyXG4gICAgLnRoZW4oKCkgPT4gY29uc29sZS5sb2coJ1Bhc3NlZCBUZXN0JykpXHJcbn07XHJcbiIsIlxyXG4vKipcclxuICogUmVnaXN0ZXIgYSBzZXJ2aWNlV29ya2VyXHJcbiAqL1xyXG5yZWdpc3RlclNlcnZpY2VXb3JrZXIgPSAoKSA9PiB7XHJcbiAgICAvL2NoZWNrIGlmIHNlcnZpY2VXb3JrZXIgaXMgc3VwcG9ydGVkLCBvdGhlcndpc2UgcmV0dXJuXHJcbiAgICBpZiAoIW5hdmlnYXRvci5zZXJ2aWNlV29ya2VyKSByZXR1cm47XHJcblxyXG4gICAgbmF2aWdhdG9yLnNlcnZpY2VXb3JrZXIucmVnaXN0ZXIoJy9zdy5qcycpLmNhdGNoKGZ1bmN0aW9uKCl7XHJcbiAgICAgIGNvbnNvbGUubG9nKFwiU29tZXRoaW5nIHdlbnQgd3JvbmcuIFNlcnZpY2VXb3JrZXIgbm90IHJlZ2lzdGVyZWRcIik7XHJcbiAgICB9KTtcclxuICB9O1xyXG5cclxuICByZWdpc3RlclNlcnZpY2VXb3JrZXIoKTtcclxuIl19