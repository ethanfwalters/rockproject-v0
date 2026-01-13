-- Create specimen reference database table
-- This stores the reference information for known specimens (minerals, rocks, fossils)
CREATE TABLE IF NOT EXISTS public.specimen_reference (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('mineral', 'rock', 'fossil')),
  hardness TEXT,
  luster TEXT,
  composition TEXT,
  streak TEXT,
  color TEXT,
  crystal_system TEXT,
  cleavage TEXT,
  fracture TEXT,
  specific_gravity TEXT,
  description TEXT,
  common_locations TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX specimen_reference_name_idx ON public.specimen_reference(LOWER(name));
CREATE INDEX specimen_reference_type_idx ON public.specimen_reference(type);

-- Insert the existing specimen data
INSERT INTO public.specimen_reference (name, type, hardness, luster, composition, streak) VALUES
  -- Minerals
  ('amethyst', 'mineral', '7', 'Vitreous', 'SiO₂', 'White'),
  ('quartz', 'mineral', '7', 'Vitreous', 'SiO₂', 'White'),
  ('pyrite', 'mineral', '6-6.5', 'Metallic', 'FeS₂', 'Greenish-black'),
  ('fluorite', 'mineral', '4', 'Vitreous', 'CaF₂', 'White'),
  ('calcite', 'mineral', '3', 'Vitreous to resinous', 'CaCO₃', 'White'),
  ('feldspar', 'mineral', '6-6.5', 'Vitreous to pearly', 'KAlSi₃O₈', 'White'),
  ('mica', 'mineral', '2-3', 'Vitreous to pearly', 'KAl₂(AlSi₃O₁₀)(OH)₂', 'White'),
  ('tourmaline', 'mineral', '7-7.5', 'Vitreous', 'Complex borosilicate', 'White'),
  ('garnet', 'mineral', '6.5-7.5', 'Vitreous to resinous', 'X₃Y₂(SiO₄)₃', 'White'),
  ('topaz', 'mineral', '8', 'Vitreous', 'Al₂SiO₄(F,OH)₂', 'White'),
  ('magnetite', 'mineral', '5.5-6.5', 'Metallic', 'Fe₃O₄', 'Black'),
  ('hematite', 'mineral', '5-6', 'Metallic to earthy', 'Fe₂O₃', 'Reddish-brown'),
  ('galena', 'mineral', '2.5', 'Metallic', 'PbS', 'Lead gray'),
  ('malachite', 'mineral', '3.5-4', 'Adamantine to vitreous', 'Cu₂CO₃(OH)₂', 'Light green'),
  ('azurite', 'mineral', '3.5-4', 'Vitreous', 'Cu₃(CO₃)₂(OH)₂', 'Light blue'),
  ('gypsum', 'mineral', '2', 'Vitreous to silky', 'CaSO₄·2H₂O', 'White'),
  ('talc', 'mineral', '1', 'Waxy to pearly', 'Mg₃Si₄O₁₀(OH)₂', 'White'),
  ('olivine', 'mineral', '6.5-7', 'Vitreous', '(Mg,Fe)₂SiO₄', 'White'),
  ('apatite', 'mineral', '5', 'Vitreous to subresinous', 'Ca₅(PO₄)₃(F,Cl,OH)', 'White'),
  ('corundum', 'mineral', '9', 'Adamantine to vitreous', 'Al₂O₃', 'White'),
  ('diamond', 'mineral', '10', 'Adamantine', 'C', 'None'),
  ('ruby', 'mineral', '9', 'Adamantine to vitreous', 'Al₂O₃', 'White'),
  ('sapphire', 'mineral', '9', 'Adamantine to vitreous', 'Al₂O₃', 'White'),
  ('emerald', 'mineral', '7.5-8', 'Vitreous', 'Be₃Al₂Si₆O₁₈', 'White'),
  ('opal', 'mineral', '5.5-6.5', 'Vitreous to waxy', 'SiO₂·nH₂O', 'White'),
  ('turquoise', 'mineral', '5-6', 'Waxy to subvitreous', 'CuAl₆(PO₄)₄(OH)₈·4H₂O', 'White to green'),

  -- Rocks
  ('granite', 'rock', '6-7', NULL, 'Quartz, Feldspar, Mica', NULL),
  ('basalt', 'rock', '6', NULL, 'Plagioclase, Pyroxene', NULL),
  ('marble', 'rock', '3-4', NULL, 'CaCO₃ (recrystallized)', NULL),
  ('slate', 'rock', '3-4', NULL, 'Clay minerals, Quartz', NULL),
  ('sandstone', 'rock', '6-7', NULL, 'Quartz grains, Cement', NULL),
  ('limestone', 'rock', '3-4', NULL, 'CaCO₃', NULL),
  ('obsidian', 'rock', '5-6', 'Vitreous', 'Volcanic glass (SiO₂)', NULL),
  ('pumice', 'rock', '6', NULL, 'Volcanic glass with vesicles', NULL),
  ('shale', 'rock', '3', NULL, 'Clay minerals', NULL),
  ('gneiss', 'rock', '6-7', NULL, 'Feldspar, Quartz, Mica', NULL),

  -- Fossils
  ('trilobite', 'fossil', NULL, NULL, 'Calcite (CaCO₃)', NULL),
  ('ammonite', 'fossil', NULL, NULL, 'Aragonite/Calcite (CaCO₃)', NULL),
  ('dinosaur bone', 'fossil', NULL, NULL, 'Calcium phosphate (mineralized)', NULL),
  ('petrified wood', 'fossil', '7', NULL, 'SiO₂ (silicified)', NULL),
  ('shark tooth', 'fossil', '5', NULL, 'Fluorapatite', NULL),
  ('crinoid', 'fossil', NULL, NULL, 'Calcite (CaCO₃)', NULL),
  ('brachiopod', 'fossil', NULL, NULL, 'Calcite/Chitin', NULL),
  ('coral', 'fossil', '3-4', NULL, 'CaCO₃', NULL)
ON CONFLICT (name) DO NOTHING;

-- Add a comment to the table
COMMENT ON TABLE public.specimen_reference IS 'Reference database for known minerals, rocks, and fossils with their properties';
