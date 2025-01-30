import supabase, { supabaseUrl } from "./supabase";

export async function getCabins() {
  const { data, error } = await supabase.from("cabins").select("*");

  if (error) {
    console.error("Cabins could not be loaded");
    throw new Error("Cabins could not be loaded");
  }

  return data;
}

export async function createEditCabin(newCabin, id) {
  console.log(newCabin, id);

  const hasImagePath = newCabin.image?.startsWith?.(supabaseUrl);

  const imageName = `${Math.random()}-${newCabin.image.name}`.replaceAll(
    "/",
    ""
  ); // Remove all /'s if they're in the file name, otherwise supsabase will create subfolders

  const imagePath = hasImagePath
    ? newCabin.image
    : `${supabaseUrl}/storage/v1/object/public/cabin-images/${imageName}`;

  // 1. Create/edit cabin
  let query = supabase.from("cabins");

  // A) CREATE
  if (!id) query = query.insert([{ ...newCabin, image: imagePath }]);

  // B) EDIT
  if (id) query = query.update({ ...newCabin, image: imagePath }).eq("id", id); // In supabase, only update the row where the id = the id we passed

  const { data, error } = await query.select().single(); // This is the same thing as if you wrote const {data, error} await.insert([{ ...newCabin, image: imagePath }]) but we need to use a "let" variable because we are using it for editing and creating.

  if (error) {
    console.error("Cabins could not be loaded");
    throw new Error("Cabins could not be created");
  }

  // 2. Upload image
  const { error: storageError } = await supabase.storage // Rename error here because you cannot use it twice like above
    .from("cabin-images")
    .upload(imageName, newCabin.image);

  // 3. Delete the cabin IF there was an error uploading image
  if (storageError) {
    await supabase.from("cabins").delete().eq("id", data.id);
    console.error(storageError);
    throw new Error("Cabin image could not be uploaded");
  }

  return data;
}

export async function deleteCabin(id) {
  const { data, error } = await supabase.from("cabins").delete().eq("id", id);

  if (error) {
    console.error("Cabins could not be loaded");
    throw new Error("Cabins could not be deleted");
  }

  return data;
}
