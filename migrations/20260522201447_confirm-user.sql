CREATE OR REPLACE FUNCTION confirm_user_email(p_email text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  UPDATE auth.users
  SET email_verified = true
  WHERE email = p_email
  RETURNING id INTO v_user_id;

  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'User not found');
  END IF;

  INSERT INTO profiles (id, name, email)
  VALUES (v_user_id, 'Prueba 1', p_email)
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

  RETURN json_build_object('success', true, 'user_id', v_user_id);
END;
$$;
