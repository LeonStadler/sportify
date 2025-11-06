-- Prüfe ob start_time korrekt in der Datenbank ist
SELECT 
    id,
    title,
    start_time,
    pg_typeof(start_time) as start_time_type,
    created_at
FROM workouts 
ORDER BY created_at DESC 
LIMIT 5;
