-- Add public read policy for RunningLogs
CREATE POLICY "Allow public read for RunningLogs"
ON public."RunningLogs"
FOR SELECT
TO anon
USING (true);

-- Add public read policy for UserGoals
CREATE POLICY "Allow public read for UserGoals"
ON public."UserGoals"
FOR SELECT
TO anon
USING (true);
