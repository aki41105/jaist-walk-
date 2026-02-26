-- Admin dashboard stats
CREATE OR REPLACE FUNCTION get_admin_dashboard_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_users', (SELECT COUNT(*) FROM users),
    'today_scans', (SELECT COUNT(*) FROM scans WHERE date = CURRENT_DATE),
    'active_qr_codes', (SELECT COUNT(*) FROM qr_locations WHERE is_active = true),
    'total_points_distributed', (SELECT COALESCE(SUM(amount), 0) FROM point_transactions WHERE amount > 0)
  ) INTO result;
  RETURN result;
END;
$$;

-- Daily scan counts for a given period
CREATE OR REPLACE FUNCTION get_daily_scan_counts(days_back INTEGER DEFAULT 7)
RETURNS TABLE(scan_date DATE, scan_count BIGINT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT d::date AS scan_date, COALESCE(COUNT(s.id), 0) AS scan_count
  FROM generate_series(
    CURRENT_DATE - (days_back - 1),
    CURRENT_DATE,
    '1 day'::interval
  ) d
  LEFT JOIN scans s ON s.date = d::date
  GROUP BY d::date
  ORDER BY d::date;
END;
$$;

-- Popular locations ranking
CREATE OR REPLACE FUNCTION get_location_ranking(days_back INTEGER DEFAULT 7)
RETURNS TABLE(location_id UUID, name_ja TEXT, name_en TEXT, location_number INTEGER, scan_count BIGINT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ql.id AS location_id,
    ql.name_ja,
    ql.name_en,
    ql.location_number,
    COUNT(s.id) AS scan_count
  FROM qr_locations ql
  LEFT JOIN scans s ON s.qr_location_id = ql.id AND s.date >= CURRENT_DATE - days_back
  GROUP BY ql.id, ql.name_ja, ql.name_en, ql.location_number
  ORDER BY scan_count DESC;
END;
$$;

-- Outcome distribution for a given period
CREATE OR REPLACE FUNCTION get_outcome_distribution(days_back INTEGER DEFAULT 7)
RETURNS TABLE(outcome TEXT, outcome_count BIGINT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.outcome::TEXT,
    COUNT(*) AS outcome_count
  FROM scans s
  WHERE s.date >= CURRENT_DATE - days_back
  GROUP BY s.outcome
  ORDER BY outcome_count DESC;
END;
$$;
