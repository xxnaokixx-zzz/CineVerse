import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  console.log('GET /api/search-history - User check:', { user: !!user, userError });

  if (userError || !user) {
    console.log('GET /api/search-history - Unauthorized:', { userError });
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  console.log('GET /api/search-history - Fetching history for user:', user.id);

  const { data, error } = await supabase
    .from('search_history')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10);

  console.log('GET /api/search-history - Supabase response:', { hasData: !!data, error });

  if (error) {
    console.error('GET /api/search-history - Supabase error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // カラム名をフロントエンド用に変換
  const transformedData = data?.map(item => ({
    id: item.id,
    tmdb_id: item.tmdb_id,
    query: item.query,
    officialTitle: item.official_title,
    timestamp: item.timestamp,
    imageUrl: item.image_url,
    rating: item.rating,
    year: item.year,
    cast: item.cast,
    crew: item.crew,
    mediaType: item.media_type,
    personId: item.person_id,
    personName: item.person_name,
    personDepartment: item.person_department,
    personKnownFor: item.person_known_for,
    profilePath: item.profile_path,
  })) || [];

  return NextResponse.json({ history: transformedData });
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    console.log('POST /api/search-history - User check:', { user: !!user, userError });

    if (userError || !user) {
      console.log('POST /api/search-history - Unauthorized:', { userError });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    console.log('POST /api/search-history - Request body:', JSON.stringify(body, null, 2));

    const insertData = {
      query: body.query,
      official_title: body.officialTitle,
      timestamp: body.timestamp,
      image_url: body.imageUrl,
      rating: body.rating,
      year: body.year,
      cast: body.cast,
      crew: body.crew,
      media_type: body.mediaType,
      tmdb_id: body.id,
      person_id: body.personId,
      person_name: body.personName,
      person_department: body.personDepartment,
      person_known_for: body.personKnownFor,
      profile_path: body.profilePath,
      user_id: user.id,
      created_at: new Date().toISOString(),
    };
    console.log('POST /api/search-history - Insert data:', JSON.stringify(insertData, null, 2));

    const { data, error } = await supabase.from('search_history').insert(insertData);

    console.log('POST /api/search-history - Supabase insert result:', {
      hasData: !!data,
      error: error ? {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      } : null
    });

    if (error) {
      console.error('POST /api/search-history - Supabase insert error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        fullError: error
      });
      return NextResponse.json({
        error: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('POST /api/search-history - Unexpected error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const tmdb_id = searchParams.get('tmdb_id');
  const timestamp = searchParams.get('timestamp');
  const all = searchParams.get('all');

  let queryBuilder = supabase.from('search_history').delete().eq('user_id', user.id);

  if (all === 'true') {
    // No additional filters needed for 'all'
  } else if (id) {
    queryBuilder = queryBuilder.eq('id', id);
  } else if (tmdb_id) {
    queryBuilder = queryBuilder.eq('tmdb_id', tmdb_id);
  } else if (timestamp) {
    // timestampは文字列として渡ってくるので数値に変換
    queryBuilder = queryBuilder.eq('timestamp', Number(timestamp));
  } else {
    return NextResponse.json({ error: 'Specify id, tmdb_id, timestamp, or all=true' }, { status: 400 });
  }

  console.log('DELETE /api/search-history - Executing query with params:', { id, tmdb_id, timestamp, all });
  const { error } = await queryBuilder;

  if (error) {
    console.error('DELETE /api/search-history - Supabase error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  console.log('DELETE /api/search-history - Successfully deleted item');
  return NextResponse.json({ success: true });
} 