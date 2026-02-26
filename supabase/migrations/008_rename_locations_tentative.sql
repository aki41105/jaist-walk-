-- Rename all locations to tentative names based on location_number
UPDATE qr_locations
SET
  name_ja = 'エリア' || location_number || '（仮）',
  name_en = 'Area ' || location_number || ' (tentative)';
