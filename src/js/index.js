import Search from './models/Search';
import * as searchView from './views/searchView';
import Recipe from './models/Recipe';
import * as recipeView from './views/recipeView';
import List from './models/List';
import * as listView from './views/listView';
import Likes from './models/Likes';
import * as likesView from './views/likesView';
import { elements, renderLoader, clearLoader } from './views/base';

/** Global state of the app
 * - Search object
 * - current recipe object
 * - Shopping list object
 * - Liked recipes
 */

 const state = {};

/**
 * SEARCH CONTROLLER
 */
 const controlSearch = async () => {
  // Get query from view
  const query = searchView.getInput();

  if (query) {
    // New search object and add to state
    state.search = new Search(query);

    // Prepare UI for results
    searchView.clearInput();
    searchView.clearResults();
    renderLoader(elements.searchResults);

    try {
      // Search for recipes
      await state.search.getResults();
      // Render results to UI
      clearLoader();
      searchView.renderResults(state.search.result);
    } catch (e) {
      clearLoader();
      alert('Error fetching recipes');
    }
  }
 };

elements.searchForm.addEventListener('submit', e => {
  e.preventDefault();
  controlSearch();
 });

 elements.searchResPages.addEventListener('click', e => {
   
  const btn = e.target.closest(".btn-inline");
  
  if (btn) {
    const goToPage = parseInt(btn.dataset.goto, 10);
    searchView.clearResults();
    searchView.renderResults(state.search.result, goToPage);
  }
  
 });

 /**
 * RECIPE CONTROLLER
 */
const controlRecipe = async () => {
  // Fetch ID from URL
  const id = window.location.hash.replace('#', '');

  if (id) {
    // Prep UI for changes
    recipeView.clearRecipe();
    renderLoader(elements.recipe);

    // Highlight selected recipe
    if (state.search) searchView.highlightSelected(id);

    // Create new recipe object
    state.recipe = new Recipe(id);

    try {
      // Fetch recipe data and parse ingredients
      await state.recipe.getRecipe();
      state.recipe.parseIngredients();
      
      // Calculate servings and time
      state.recipe.calcTime();
      state.recipe.calcServings();
      
      // Render recipe
      clearLoader();
      
      recipeView.renderRecipe(
        state.recipe,
        state.likes.isLiked(id)
      );
    } catch(e) {
      alert('Error fetching recipe');
    }
  }
};

// Listen for change in URL hash and page load to trigger recipe search
['hashchange', 'load'].forEach(e => window.addEventListener(e, controlRecipe));

/**
 * RECIPE CONTROLLER
 */
const controlList = () => {
  // Create a new list if there is none
  if (!state.list) state.list = new List();

  // Add each ingredient to the List
  state.recipe.ingredients.forEach(el => {
    const item = state.list.addItem(el.count, el.unit, el.ingredient);
    listView.renderItem(item);
  });
};

// Handle delete and update list events
elements.shopping.addEventListener('click', e => {
  const id = e.target.closest('.shopping__item').dataset.itemid;

  // Handle a litem item delete event
  if (e.target.matches('.shopping__delete, .shopping__delete *')) {
    // Delete from state
    state.list.deleteItem(id);

    // Delete from view
    listView.deleteItem(id);

  } else if (e.target.matches('.shopping__count-value')) {
    const val = parseFloat(e.target.value, 10);
    state.list.updateCount(id, val);
    
  }
});

/**
 * LIKE CONTROLLER
 */
const controlLike = () => {
  if (!state.likes) state.likes = new Likes();
  const currentID = state.recipe.id;

  // User has NOT yet liked current recipe
  if (!state.likes.isLiked(currentID)) {
    // Add like to the state

    const newLike = state.likes.addLike(
      currentID,
      state.recipe.title,
      state.recipe.publisher,
      state.recipe.img
    );

    // Toggle like button
    likesView.toggleLikeBtn(true);

    // Add liket o UI list
    likesView.renderLike(newLike);

  // User HAS liked the current recipe
  } else {
    // Remove like from state
    state.likes.deleteLike(currentID);

    // Toggle the like button
    likesView.toggleLikeBtn(false);

    // Remove like from the UI
    likesView.deleteLike(currentID);
  }
  likesView.toggleLikeMenu(state.likes.getNumLikes());
};

// Restore liked recipes on page load
window.addEventListener('load', () => {
  state.likes = new Likes();

  // Restore likes
  state.likes.readStorage();

  // Toggle like menu button
  likesView.toggleLikeMenu(state.likes.getNumLikes());

  // Render existing likes
  state.likes.likes.forEach(like => likesView.renderLike(like));
});

// Handling recipe button clicks
elements.recipe.addEventListener('click', e => {
  if (e.target.matches(".btn-decrease, .btn-decrease *")) {
    // Decrease button is clicked
    if (state.recipe.servings > 1) {
      state.recipe.updateServings("dec");
      recipeView.updateServingsIngredients(state.recipe);
    } 
  } else if (e.target.matches(".btn-increase, .btn-increase *")) {
    // Increase button is clicked
    state.recipe.updateServings("inc");
    recipeView.updateServingsIngredients(state.recipe);
  } else if (e.target.matches(".recipe__btn--add, .recipe__btn--add *")) {
    // Add ingredients to shopp[ing list
    controlList();
  } else if (e.target.matches('.recipe__love, .recipe__love *')) {
    // Like controller
    controlLike();
  }
});