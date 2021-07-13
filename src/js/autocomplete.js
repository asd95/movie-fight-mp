function createAutoComplete({
  root,
  onRenderOption,
  onOptionSelect,
  inputValue,
  fetchData,
}) {
  // render root template on page
  root.innerHTML = `
  <h1 class="title-movie-search">Search</h1>
    <input type="text" class="input">
    <ul class="dropdown-menu">
    </ul>
`;
  // get items from root
  const input = root.querySelector(".input");
  const dropdownMenu = root.querySelector(".dropdown-menu");

  // 
  const onInput = async (e) => {
    try {
      // get Data
      const items = await fetchData(e.target.value);

      // dropdown !visible
      items.length > 0
        ? dropdownMenu.classList.add("show")
        : dropdownMenu.classList.remove("show");
      dropdownMenu.innerHTML = "";
      
      // 
      items.forEach((item) => {
        // create a dropdown-item
        const dropdownItem = createDropdownItem(onRenderOption, item);
        // append dropdown-item in dropdown-menu
        dropdownMenu.appendChild(dropdownItem);
      });
    } catch (e) {
      // error handling
      throw new Error(e);
    }
  };

  function createDropdownItem(onRenderOption, item) {
    const li = document.createElement("li");
    const option = document.createElement("a");

    option.classList.add("dropdown-item");
    option.innerHTML = onRenderOption(item);
    option.addEventListener("click", () => onDropdownItem(item));
    li.appendChild(option)
    return li;
  }

  function onDropdownItem(item) {
    dropdownMenu.classList.remove("show");
    input.value = inputValue(item);

    onOptionSelect(item);
  }

  // event listener
  input.addEventListener("input", deBounce(onInput, 500));
  document.addEventListener("click", (e) => {
    if (!dropdownMenu.classList.contains("show")) {
      return;
    }
    if (!root.contains(e.target)) {
      dropdownMenu.classList.remove("show");
    }
  });
}
