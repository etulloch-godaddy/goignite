import os
from typing import Optional
from urllib.parse import urlencode

import httpx
from dotenv import load_dotenv

from app.models.achievement import Achievement, AchievementCategory

load_dotenv()

MOCK_MODE = os.getenv("MOCK_SOCIAL_APIS", "true").lower() == "true"

META_APP_ID = os.getenv("META_APP_ID", "")
META_APP_SECRET = os.getenv("META_APP_SECRET", "")
META_REDIRECT_URI = os.getenv(
    "META_REDIRECT_URI", "http://localhost:8000/api/social/callback/instagram"
)

TIKTOK_CLIENT_KEY = os.getenv("TIKTOK_CLIENT_KEY", "")
TIKTOK_CLIENT_SECRET = os.getenv("TIKTOK_CLIENT_SECRET", "")
TIKTOK_REDIRECT_URI = os.getenv(
    "TIKTOK_REDIRECT_URI", "http://localhost:8000/api/social/callback/tiktok"
)

MOCK_STATS = {
    "instagram": {
        "platform": "instagram",
        "connected": True,
        "username": "valentinas_hotsauce",
        "followers": 2847,
        "posts": 63,
        "profile_url": "https://instagram.com/valentinas_hotsauce",
    },
    "tiktok": {
        "platform": "tiktok",
        "connected": True,
        "username": "valentinas_hotsauce",
        "followers": 5120,
        "videos": 41,
        "profile_url": "https://tiktok.com/@valentinas_hotsauce",
    },
    "facebook": {
        "platform": "facebook",
        "connected": True,
        "username": "Valentina's Hot Sauce",
        "followers": 890,
        "posts": 34,
        "profile_url": "https://facebook.com/valentinashotsauce",
    },
}


def get_oauth_url(platform: str) -> dict:
    if MOCK_MODE:
        return {
            "platform": platform,
            "auth_url": f"http://localhost:8000/api/social/mock-oauth/{platform}",
            "mock": True,
        }

    if platform == "instagram":
        params = {
            "client_id": META_APP_ID,
            "redirect_uri": META_REDIRECT_URI,
            "scope": "instagram_basic,pages_read_engagement",
            "response_type": "code",
            "state": platform,
        }
        url = f"https://www.facebook.com/v19.0/dialog/oauth?{urlencode(params)}"
        return {"platform": platform, "auth_url": url, "mock": False}

    if platform == "facebook":
        params = {
            "client_id": META_APP_ID,
            "redirect_uri": META_REDIRECT_URI,
            "scope": "pages_read_engagement,pages_show_list",
            "response_type": "code",
            "state": platform,
        }
        url = f"https://www.facebook.com/v19.0/dialog/oauth?{urlencode(params)}"
        return {"platform": platform, "auth_url": url, "mock": False}

    if platform == "tiktok":
        params = {
            "client_key": TIKTOK_CLIENT_KEY,
            "redirect_uri": TIKTOK_REDIRECT_URI,
            "scope": "user.info.basic",
            "response_type": "code",
            "state": platform,
        }
        url = f"https://www.tiktok.com/v2/auth/authorize/?{urlencode(params)}"
        return {"platform": platform, "auth_url": url, "mock": False}

    raise ValueError(f"Unsupported platform: {platform}")


async def exchange_code_for_stats(platform: str, code: str) -> dict:
    if MOCK_MODE:
        return MOCK_STATS.get(platform, {"platform": platform, "connected": False})

    async with httpx.AsyncClient() as client:
        if platform in ("instagram", "facebook"):
            token_resp = await client.post(
                "https://graph.facebook.com/v19.0/oauth/access_token",
                params={
                    "client_id": META_APP_ID,
                    "client_secret": META_APP_SECRET,
                    "redirect_uri": META_REDIRECT_URI,
                    "code": code,
                },
            )
            token_resp.raise_for_status()
            access_token = token_resp.json()["access_token"]

            if platform == "instagram":
                me_resp = await client.get(
                    "https://graph.facebook.com/v19.0/me",
                    params={
                        "fields": "instagram_business_account",
                        "access_token": access_token,
                    },
                )
                ig_id = me_resp.json().get("instagram_business_account", {}).get("id")
                if ig_id:
                    stats_resp = await client.get(
                        f"https://graph.facebook.com/v19.0/{ig_id}",
                        params={
                            "fields": "username,followers_count,media_count",
                            "access_token": access_token,
                        },
                    )
                    data = stats_resp.json()
                    return {
                        "platform": "instagram",
                        "connected": True,
                        "username": data.get("username", ""),
                        "followers": data.get("followers_count", 0),
                        "posts": data.get("media_count", 0),
                        "profile_url": f"https://instagram.com/{data.get('username', '')}",
                    }

            if platform == "facebook":
                me_resp = await client.get(
                    "https://graph.facebook.com/v19.0/me",
                    params={"fields": "name,fan_count", "access_token": access_token},
                )
                data = me_resp.json()
                return {
                    "platform": "facebook",
                    "connected": True,
                    "username": data.get("name", ""),
                    "followers": data.get("fan_count", 0),
                    "profile_url": "",
                }

        if platform == "tiktok":
            token_resp = await client.post(
                "https://open.tiktokapis.com/v2/oauth/token/",
                data={
                    "client_key": TIKTOK_CLIENT_KEY,
                    "client_secret": TIKTOK_CLIENT_SECRET,
                    "code": code,
                    "grant_type": "authorization_code",
                    "redirect_uri": TIKTOK_REDIRECT_URI,
                },
                headers={"Content-Type": "application/x-www-form-urlencoded"},
            )
            token_resp.raise_for_status()
            access_token = token_resp.json()["access_token"]

            stats_resp = await client.get(
                "https://open.tiktokapis.com/v2/user/info/",
                params={"fields": "display_name,follower_count,video_count"},
                headers={"Authorization": f"Bearer {access_token}"},
            )
            data = stats_resp.json().get("data", {}).get("user", {})
            return {
                "platform": "tiktok",
                "connected": True,
                "username": data.get("display_name", ""),
                "followers": data.get("follower_count", 0),
                "videos": data.get("video_count", 0),
                "profile_url": f"https://tiktok.com/@{data.get('display_name', '')}",
            }

    return {"platform": platform, "connected": False}


ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")

MOCK_CONTENT_IDEAS = [
    # --- Week 1: Brand Story & Product Education ---
    {"day": 1, "post_type": "Photo", "hook": "Meet Valentina's Hot Sauce — made from a recipe that was never meant to leave the kitchen", "caption": "My grandmother made this sauce for the family for 40 years. Every batch is still handcrafted the same way — real peppers, real ingredients, no shortcuts. Now it's in a bottle. Order online at the link in bio.", "hashtags": ["#ValentinasHotSauce", "#SmallBatchHotSauce", "#HandcraftedFood", "#HotSauce", "#MadeWithLove"], "best_time": "11:00 AM"},
    {"day": 2, "post_type": "Carousel", "hook": "The heat guide — find your level", "caption": "Our heat levels are built for different palates. Mild for everyday use. Medium for those who want a real kick. Extra Hot for people who know what they are getting into. Which one is yours? Order at the link in bio.", "hashtags": ["#HotSauce", "#HeatScale", "#SpicyFoodLovers", "#SmallBatchHotSauce", "#ChiliPepper"], "best_time": "12:00 PM"},
    {"day": 3, "post_type": "Reel", "hook": "What goes into every bottle — and why it matters", "caption": "Fresh chilis. No artificial preservatives. Bottled by hand. Labeled by hand. Every bottle that leaves our kitchen has been touched at least a dozen times. That attention is what you taste.", "hashtags": ["#Ingredients", "#CleanLabel", "#SmallBatch", "#HandcraftedFood", "#HotSauceLovers"], "best_time": "7:00 PM"},
    {"day": 4, "post_type": "Photo", "hook": "The ingredient we source locally — and why we won't change that", "caption": "We source our chilis from a farm 40 miles from our kitchen. We could get them cheaper elsewhere. We choose not to. The difference is in every bite.", "hashtags": ["#LocalSourcing", "#CleanIngredients", "#SmallBatch", "#FoodQuality", "#ValentinasHotSauce"], "best_time": "10:00 AM"},
    {"day": 5, "post_type": "Carousel", "hook": "5 things that make Valentina's different from store-bought", "caption": "No mass production. No artificial preservatives. Sourced locally. Made in small batches. And a recipe that has been in the family for 40 years. Slide through to see what each one means for what's in your bottle.", "hashtags": ["#SmallBatch", "#HandcraftedFood", "#HotSauce", "#CleanLabel", "#ValentinasHotSauce"], "best_time": "12:00 PM"},
    {"day": 6, "post_type": "Photo", "hook": "Your most common questions about Valentina's — answered", "caption": "Is it gluten-free? Yes. Shelf-stable? Yes — no refrigeration needed until opened. Shelf life? 18 months. How hot is Extra Hot? Enough to make you respect it. More questions? DM us anytime.", "hashtags": ["#FAQ", "#HotSauce", "#SmallFoodBrand", "#ValentinasHotSauce", "#CustomerFirst"], "best_time": "11:00 AM"},
    {"day": 7, "post_type": "Reel", "hook": "Valentina's Hot Sauce — order online, ship anywhere", "caption": "We now ship nationwide. If you have been curious and have not tried it yet, the link in bio takes you straight to the shop. First-time order? Use code FIRSTBATCH for 15% off.", "hashtags": ["#ValentinasHotSauce", "#OrderOnline", "#SmallFoodBrand", "#HotSauce", "#ShipNationwide"], "best_time": "5:00 PM"},
    # --- Week 2: Use Cases & Recipes ---
    {"day": 8, "post_type": "Carousel", "hook": "5 ways to use Valentina's this week", "caption": "Eggs. Tacos. Grilled chicken. Avocado toast. Pasta. Yes, pasta. Slide through to see how we use our sauce every day — save this for your next grocery run.", "hashtags": ["#HotSaucePairing", "#RecipeIdeas", "#HotSauce", "#SpicyFood", "#SmallBatchHotSauce"], "best_time": "12:00 PM"},
    {"day": 9, "post_type": "Reel", "hook": "The fastest way to upgrade any weeknight meal", "caption": "One bottle. Endless uses. Hot sauce is the easiest way to add depth to a dish without changing the whole recipe. Here are our three go-to weeknight moves — try one tonight.", "hashtags": ["#WeekdayMeals", "#HotSauce", "#EasyRecipes", "#SpicyCooking", "#ValentinasHotSauce"], "best_time": "6:00 PM"},
    {"day": 10, "post_type": "Photo", "hook": "Scrambled eggs will never be the same after this", "caption": "Three drops of our Mild into scrambled eggs changes everything. The heat is subtle. The flavor carries. This is the one we recommend for people who think they don't like hot sauce. Link in bio.", "hashtags": ["#BreakfastIdeas", "#HotSauce", "#EggsRecipe", "#SmallBatch", "#ValentinasHotSauce"], "best_time": "9:00 AM"},
    {"day": 11, "post_type": "Carousel", "hook": "7 recipes where our hot sauce is the secret ingredient", "caption": "Buffalo dip. Spicy honey glaze. Chili oil pasta. Elote. Smash burgers. Shakshuka. Mango habanero wings. Swipe for the full breakdown on each one — save this post and try one this week.", "hashtags": ["#RecipeIdeas", "#HotSauceRecipe", "#SpicyCooking", "#ValentinasHotSauce", "#WeeklyRecipes"], "best_time": "12:00 PM"},
    {"day": 12, "post_type": "Reel", "hook": "Hot sauce tacos — the only recipe you need this week", "caption": "Protein. Warm tortilla. Valentina's Extra Hot. Fresh onion and cilantro. That is the whole recipe. No measurement needed — just taste as you go. Link in bio if you want to order a bottle.", "hashtags": ["#TacoRecipe", "#HotSauce", "#SpicyFood", "#ValentinasHotSauce", "#SimpleRecipes"], "best_time": "7:00 PM"},
    {"day": 13, "post_type": "Photo", "hook": "Our sauce on grilled corn — a pairing we didn't expect to love this much", "caption": "Grilled corn. Butter. Our Medium. A little cotija cheese. We posted this on a Tuesday and it became our most-saved post that month. Save it for your next BBQ.", "hashtags": ["#GrilledCorn", "#HotSauce", "#BBQSeason", "#SmallBatch", "#ValentinasHotSauce"], "best_time": "11:00 AM"},
    {"day": 14, "post_type": "Carousel", "hook": "Which Valentina's heat level goes with which dish", "caption": "Mild → eggs, seafood, light soups. Medium → tacos, burgers, rice dishes. Extra Hot → wings, BBQ, anything grilled. Use this as your cheat sheet — save it and tag us when you try one.", "hashtags": ["#HotSauceGuide", "#FoodPairing", "#SpicyFood", "#ValentinasHotSauce", "#HotSauceLovers"], "best_time": "12:00 PM"},
    # --- Week 3: Behind the Scenes & Trust ---
    {"day": 15, "post_type": "Reel", "hook": "How we make every batch — start to finish", "caption": "Sourcing. Washing. Roasting. Blending. Bottling. Every step done in small batches so the flavor stays consistent. This is not mass production — this is a craft.", "hashtags": ["#HotSauceMaking", "#SmallBatch", "#BehindTheScenes", "#FoodProduction", "#ValentinasHotSauce"], "best_time": "7:00 PM"},
    {"day": 16, "post_type": "Photo", "hook": "Behind the label — the story we tried to fit on a bottle", "caption": "We designed the label ourselves. Every element has a reason — the color, the font, the grandmother's silhouette. When you pick up a bottle of Valentina's, you are holding a family story. We wanted the packaging to feel like that.", "hashtags": ["#Branding", "#SmallBusiness", "#PackagingDesign", "#HotSauce", "#ValentinasHotSauce"], "best_time": "11:00 AM"},
    {"day": 17, "post_type": "Reel", "hook": "A morning at the farmers market — packed and ready in 30 seconds", "caption": "Early morning. Boxes loaded. Table set. Farmers market days are some of our favorites — you get to watch people taste it for the first time. Nothing beats that reaction. We're there every Saturday.", "hashtags": ["#FarmersMarket", "#SmallBusiness", "#LocalFood", "#HotSauce", "#ValentinasHotSauce"], "best_time": "8:00 AM"},
    {"day": 18, "post_type": "Photo", "hook": "The real cost of making a bottle of hot sauce — not what people expect", "caption": "Fresh peppers. Vinegar. Spices. Bottles. Labels. Time. Love. We price our product to reflect its quality — not to compete with mass-produced alternatives. When you buy Valentina's, you are buying something made with intention.", "hashtags": ["#SmallBusiness", "#FoodCost", "#HandcraftedFood", "#ValentinasHotSauce", "#ShopSmall"], "best_time": "10:00 AM"},
    {"day": 19, "post_type": "Carousel", "hook": "What small-batch actually means — and why it matters to us", "caption": "Small-batch means we make less per run. It also means we catch quality issues early. We taste every batch before it ships. That is the tradeoff we make on purpose. Swipe through to see what our process looks like.", "hashtags": ["#SmallBatch", "#FoodQuality", "#BehindTheScenes", "#HandcraftedFood", "#ValentinasHotSauce"], "best_time": "12:00 PM"},
    {"day": 20, "post_type": "Photo", "hook": "A customer message that stopped us mid-morning", "caption": "We got this DM on a Tuesday and read it three times. This is why we make what we make. If you have tried Valentina's and have a story, we want to hear it — drop it in the comments or send us a message.", "hashtags": ["#CustomerStory", "#HotSauce", "#SmallBusiness", "#ValentinasHotSauce", "#Community"], "best_time": "11:00 AM"},
    {"day": 21, "post_type": "Reel", "hook": "What the labeling process actually looks like — yes, we do it by hand", "caption": "Every bottle is labeled by hand. It takes longer. We think it is worth it. Each label goes on straight because someone took the time to make sure it did. That is the kind of business we want to run.", "hashtags": ["#HandLabeled", "#SmallBatch", "#BehindTheScenes", "#FoodBusiness", "#ValentinasHotSauce"], "best_time": "6:00 PM"},
    # --- Week 4: Promotions & Community ---
    {"day": 22, "post_type": "Carousel", "hook": "3 ways to give Valentina's as a gift — for any occasion", "caption": "Birthday. Housewarming. Corporate gift basket. Slide through for our most popular bundle ideas. We do custom labels for orders of 12 or more — DM us to talk details.", "hashtags": ["#FoodGift", "#HotSauceGift", "#CorporateGifting", "#ValentinasHotSauce", "#GiftIdeas"], "best_time": "12:00 PM"},
    {"day": 23, "post_type": "Photo", "hook": "Multi-packs for the ones who go through a bottle a week", "caption": "If you're a regular, the 3-pack and 6-pack save you shipping and keep you stocked. Available at the link in bio. Mix and match heat levels — most people get one of each.", "hashtags": ["#HotSauce", "#BundleDeal", "#SmallFoodBrand", "#ValentinasHotSauce", "#OrderOnline"], "best_time": "10:00 AM"},
    {"day": 24, "post_type": "Reel", "hook": "Never run out — here is how our monthly subscription works", "caption": "One click. Monthly delivery. 10% off every order. Cancel any time. We ship the first week of each month. If you go through Valentina's regularly, the subscription pays for itself in the first order. Set it up at the link in bio.", "hashtags": ["#Subscription", "#HotSauce", "#SmallFoodBrand", "#ValentinasHotSauce", "#MonthlyDelivery"], "best_time": "7:00 PM"},
    {"day": 25, "post_type": "Photo", "hook": "We do wholesale — here is how to carry Valentina's in your restaurant or shop", "caption": "If you run a restaurant, cafe, specialty food shop, or market stall and want to carry Valentina's, DM us. We do wholesale minimums of one case. We bring samples first — no commitment to taste.", "hashtags": ["#Wholesale", "#RestaurantSupply", "#SmallFoodBrand", "#ValentinasHotSauce", "#LocalFood"], "best_time": "10:00 AM"},
    {"day": 26, "post_type": "Carousel", "hook": "Everything in the Valentina's shop right now", "caption": "Single bottles. 3-packs. 6-packs. Monthly subscription. Corporate gift sets. Custom label orders of 12+. We ship nationwide. Local pickup available at the Saturday farmers market. Full shop at the link in bio.", "hashtags": ["#ShopNow", "#ValentinasHotSauce", "#HotSauce", "#OrderOnline", "#SmallFoodBrand"], "best_time": "12:00 PM"},
    {"day": 27, "post_type": "Reel", "hook": "Tag someone who needs Valentina's in their life", "caption": "You know the person. The one who puts hot sauce on everything. The one who carries a bottle in their bag. Tag them — and we'll pick one to receive a free 3-pack this week.", "hashtags": ["#HotSauceLovers", "#TagAFriend", "#ValentinasHotSauce", "#Giveaway", "#SpicyFood"], "best_time": "5:00 PM"},
    {"day": 28, "post_type": "Photo", "hook": "Something new is coming — drop a comment if you want the first look", "caption": "We have been working on something we are really excited about. New flavor. New format. Something we have never offered before. Everyone who comments gets early access when it drops.", "hashtags": ["#ComingSoon", "#NewProduct", "#ValentinasHotSauce", "#HotSauce", "#SmallFoodBrand"], "best_time": "11:00 AM"},
    {"day": 29, "post_type": "Carousel", "hook": "How to find us — online, in person, and wholesale", "caption": "Online: order at the link in bio. In person: we are at the farmers market every Saturday. Wholesale: DM us and we bring samples. Gift orders: DM for custom labels and bulk pricing. We want Valentina's everywhere.", "hashtags": ["#ValentinasHotSauce", "#HowToOrder", "#SmallFoodBrand", "#HotSauce", "#LocalBusiness"], "best_time": "12:00 PM"},
    {"day": 30, "post_type": "Photo", "hook": "Thank you — and here is what is on the way", "caption": "A new product is in development. More stockists are coming. And we are always at the farmers market on Saturday. Thank you for following along and for every order. Valentina's is built one bottle at a time — and you are part of that.", "hashtags": ["#ValentinasHotSauce", "#ThankYou", "#SmallFoodBrand", "#HotSauce", "#Community"], "best_time": "11:00 AM"},
]


async def generate_content_ideas(creator_type: str, stage: str, platform: str, onboarding: Optional[dict] = None) -> list:
    if MOCK_MODE or not ANTHROPIC_API_KEY:
        return MOCK_CONTENT_IDEAS

    onboarding_context = ""
    if onboarding:
        lines = [f"  - {k}: {v}" for k, v in onboarding.items()]
        onboarding_context = "Creator's business details:\n" + "\n".join(lines) + "\n\n"

    prompt = (
        f"You are a social media strategist for {creator_type} content creators at the '{stage}' stage "
        f"of building their creator business. Generate exactly 7 post ideas for {platform}. "
        f"Each idea should be action-oriented, realistic, and under 30 minutes to create.\n\n"
        f"{onboarding_context}"
        f"Return a JSON array of 7 objects. Each object must have these exact keys:\n"
        f"- day (integer 1-7)\n"
        f"- post_type (string: Photo, Reel, Carousel, Story, or Live)\n"
        f"- hook (string: one punchy opening line under 12 words)\n"
        f"- caption (string: 2-3 sentences, conversational, ends with engagement prompt)\n"
        f"- hashtags (array of exactly 5 strings including the # symbol)\n"
        f"- best_time (string: e.g. '7:00 PM')\n\n"
        f"Return only valid JSON, no explanation."
    )

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            "https://api.anthropic.com/v1/messages",
            headers={
                "x-api-key": ANTHROPIC_API_KEY,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            },
            json={
                "model": "claude-sonnet-4-6",
                "max_tokens": 2000,
                "messages": [{"role": "user", "content": prompt}],
            },
            timeout=30.0,
        )
        resp.raise_for_status()
        raw = resp.json()["content"][0]["text"].strip()
        # Strip markdown code fences if present
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        import json as _json
        return _json.loads(raw.strip())


def build_achievement(user_id: str, mission: dict) -> Achievement:
    return Achievement(
        user_id=user_id,
        title=mission.get("achievement_title", mission["title"]),
        impact=mission["impact"],
        category=AchievementCategory.monetization,
    )


async def fetch_onboarding_data(user_id: str) -> dict:
    """Fetch the user's onboarding data from the shared users service. Returns {} on failure."""
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                f"http://localhost:8000/api/users/{user_id}/onboarding-data",
                timeout=3.0,
            )
            if resp.status_code == 200:
                return resp.json().get("onboarding_data", {})
    except Exception:
        pass
    return {}


# ─── Creator-type static data (used in mock mode) ─────────────────────────────

_CREATOR_HASHTAGS: dict = {
    "food":    ["#ValentinasHotSauce", "#SmallBatchHotSauce", "#HotSauceLovers", "#FoodEntrepreneur", "#HandcraftedFood"],
    "fashion": ["#FashionBusiness", "#StyleCreator", "#OOTD", "#FashionBrand", "#SmallFashionBusiness"],
    "art":     ["#ArtBusiness", "#HandmadeArt", "#ArtForSale", "#SmallArtBusiness", "#ArtCreator"],
    "fitness": ["#FitnessBusiness", "#FitnessCreator", "#HealthCoach", "#WellnessBrand", "#FitnessJourney"],
    "gaming":  ["#GamingCreator", "#GameStreamer", "#GamingContent", "#GamingCommunity", "#GamingBusiness"],
}
_CREATOR_KEYWORDS: dict = {
    "food":    [{"keyword": "small-batch hot sauce", "relevance": "high"}, {"keyword": "artisan hot sauce", "relevance": "high"}, {"keyword": "hot sauce brand", "relevance": "high"}, {"keyword": "handcrafted condiment", "relevance": "medium"}, {"keyword": "spicy food", "relevance": "medium"}, {"keyword": "food entrepreneur", "relevance": "medium"}, {"keyword": "small food business", "relevance": "low"}],
    "fashion": [{"keyword": "fashion creator", "relevance": "high"}, {"keyword": "OOTD", "relevance": "high"}, {"keyword": "style tips", "relevance": "high"}, {"keyword": "outfit inspo", "relevance": "medium"}, {"keyword": "fashion brand", "relevance": "medium"}, {"keyword": "thrift finds", "relevance": "medium"}, {"keyword": "small fashion business", "relevance": "low"}],
    "art":     [{"keyword": "original artwork", "relevance": "high"}, {"keyword": "art for sale", "relevance": "high"}, {"keyword": "handmade art", "relevance": "high"}, {"keyword": "art commission", "relevance": "medium"}, {"keyword": "small art business", "relevance": "medium"}, {"keyword": "illustration", "relevance": "medium"}, {"keyword": "art print", "relevance": "low"}],
    "fitness": [{"keyword": "fitness tips", "relevance": "high"}, {"keyword": "workout routine", "relevance": "high"}, {"keyword": "wellness coach", "relevance": "high"}, {"keyword": "health journey", "relevance": "medium"}, {"keyword": "fitness business", "relevance": "medium"}, {"keyword": "personal trainer", "relevance": "medium"}, {"keyword": "fit lifestyle", "relevance": "low"}],
    "gaming":  [{"keyword": "gaming content", "relevance": "high"}, {"keyword": "game streamer", "relevance": "high"}, {"keyword": "game review", "relevance": "high"}, {"keyword": "gaming community", "relevance": "medium"}, {"keyword": "live stream", "relevance": "medium"}, {"keyword": "gaming tips", "relevance": "medium"}, {"keyword": "esports", "relevance": "low"}],
}
_CREATOR_BIO_TEMPLATE: dict = {
    "food":    "{name} | Small-batch {niche} | Grandma's recipe, made with love. Order online — link below 🌶️",
    "fashion": "{name} | {niche} | Daily fits + styling tips. Shop the link in bio.",
    "art":     "{name} | Original {niche} | Commissions open. New pieces every week. Link in bio.",
    "fitness": "{name} | {niche} | Workouts, tips + coaching. DM to start your journey.",
    "gaming":  "{name} | {niche} content | Live streams + reviews. Join the community below.",
}
_CREATOR_BIO_TIPS: dict = {
    "food": ["Put your product type ('hot sauce', 'small-batch') in the first line — that's what shows in search results.", "Add 'Order online' or 'DM for wholesale' — food brands with a clear purchase CTA convert 3x better.", "Mention your origin story in one line ('Grandma's recipe') — emotional hooks drive follows on product accounts.", "Include your posting cadence ('new batches every Friday') to build anticipation and repeat visits."],
    "fashion": ["Put your style niche in the first line for search indexing.", "Include a CTA like 'shop the link in bio' — fashion accounts with a shop CTA see higher click-through.", "Mention your posting frequency to signal active creator status to the algorithm.", "Add a personality hook — bios with a unique voice get more follows from profile visitors."],
    "art": ["State your medium and style in the first line ('watercolor portraits', 'digital illustration').", "Include commission status — 'Commissions open' is the top-searched phrase for art buyers.", "Link to a portfolio or shop — art buyers decide in seconds; give them a direct path.", "Mention turnaround or drop schedule to set buyer expectations."],
    "fitness": ["Lead with your specialty ('strength training', 'yoga') — that's your search keyword.", "Add credentials or results ('helped 200+ clients') — trust signals matter in wellness.", "Include a clear CTA: 'DM for coaching' or 'free program in link in bio'.", "Mention who you help ('busy moms', 'beginner lifters') to attract your ideal audience."],
    "gaming": ["State your game genre or main game in the first line — that's what gaming audiences search.", "Include your streaming schedule — consistency drives subscriber retention.", "Add your community angle ('competitive tips', 'chill streams', 'game reviews').", "Link to your Discord or stream — gaming audiences expect a community hub."],
}


def _build_mock_seo_profile(creator_type: str, onboarding: dict) -> dict:
    name = onboarding.get("business_name") or "Your Business"
    niche = onboarding.get("niche") or onboarding.get("creator_type_label") or creator_type
    template = _CREATOR_BIO_TEMPLATE.get(creator_type, _CREATOR_BIO_TEMPLATE["food"])
    rewrite = template.format(name=name, niche=niche)
    tips = _CREATOR_BIO_TIPS.get(creator_type, _CREATOR_BIO_TIPS["food"])
    return {"score": 45, "keywords_present": [], "keywords_missing": [], "rewritten_bio": rewrite, "tips": tips, "mock": True}


_CREATOR_HOOKS: dict = {
    "food": [
        "This is how Valentina's Hot Sauce gets made — no shortcuts →",
        "Grandma's secret recipe, now in a bottle →",
        "Behind the scenes at {name}: batch day 🌶️",
    ],
    "fashion": [
        "Today's look, broken down →",
        "The piece everyone keeps asking about →",
        "Style tip that works for any wardrobe →",
    ],
    "art": [
        "This one took {name} 3 weeks to finish →",
        "New work just dropped →",
        "Here's what went into making this →",
    ],
    "fitness": [
        "The move most people skip — but shouldn't →",
        "This changed my clients' results in 2 weeks →",
        "Quick tip for anyone starting out →",
    ],
    "gaming": [
        "This strategy changed everything →",
        "Watch until the end — this one's worth it →",
        "Here's what most players get wrong →",
    ],
}
_CREATOR_CTAS: dict = {
    "food":    "Order yours at the link in bio. New batches drop every week — DM for wholesale.",
    "fashion": "Shop the look at the link in bio. DM for sizing.",
    "art":     "Commissions open — DM to start yours. Prints available at the link in bio.",
    "fitness": "DM for 1:1 coaching. Free starter guide at the link in bio.",
    "gaming":  "Follow for daily content. Join the community at the link below.",
}


def _build_mock_caption_result(content: str, creator_type: str, onboarding: dict) -> dict:
    import random as _random
    name = onboarding.get("business_name") or "our brand"
    hashtags = _CREATOR_HASHTAGS.get(creator_type, _CREATOR_HASHTAGS["food"])
    hooks = _CREATOR_HOOKS.get(creator_type, _CREATOR_HOOKS["food"])
    hook = hooks[hash(content) % len(hooks)].format(name=name)
    cta = _CREATOR_CTAS.get(creator_type, _CREATOR_CTAS["food"])
    hashtag_str = " ".join(hashtags)

    optimized = f"{hook}\n\n{content}\n\n{cta}\n\n{hashtag_str}"
    keywords_added = [h.lstrip("#") for h in hashtags]
    explanation = (
        f"Added a strong opening hook to stop the scroll — the first line is the most important for reach. "
        f"Moved your caption to the body and added a '{creator_type}'-specific CTA for {name} to drive action. "
        f"Placed {len(hashtags)} niche hashtags at the end (platform best practice — hashtags in comments or end of caption outperform mid-caption placement)."
    )
    return {"original": content, "optimized": optimized, "keywords_added": keywords_added, "explanation": explanation, "mock": True}


MOCK_SEO_PROFILE_ANALYSIS = {}   # unused — replaced by _build_mock_seo_profile()
MOCK_SEO_CONTENT_OPTIMIZATION = {}  # unused — replaced by _build_mock_caption_result()


MOCK_GROWTH_PLAN = {
    "plan_horizon": "30 days",
    "biggest_opportunity": "Valentina's Hot Sauce has something most brands would pay millions for — a real family origin story. Leaning into that story on TikTok Reels will drive emotional connection and shares faster than any product post alone.",
    "actions": [
        {
            "rank": 1,
            "title": "Post 3x origin story Reels per week",
            "why": "Food brands with a personal story grow 2x faster than product-only accounts. Your grandmother's recipe is your biggest differentiator — make it the center of your TikTok and Instagram Reels strategy.",
            "time_estimate": "3–4 hrs/week",
            "expected_impact": "500–1,000 new followers in 30 days",
            "platform": "tiktok"
        },
        {
            "rank": 2,
            "title": "DM 5 local restaurants about wholesale",
            "why": "At your stage, wholesale accounts are your fastest path to consistent revenue. Local restaurants love supporting small-batch brands — and 5 outreach DMs per week typically yields 1–2 meetings.",
            "time_estimate": "1 hr total",
            "expected_impact": "First wholesale conversation within 2 weeks",
            "platform": "instagram"
        },
        {
            "rank": 3,
            "title": "Film a hot sauce pairing video this week",
            "why": "Food pairing content gets 2x more saves than standard product posts. Saves are the highest-value action on Instagram and TikTok — they signal quality content and boost your next post's reach by 30–50%.",
            "time_estimate": "30 min to film + post",
            "expected_impact": "+30% reach on your next post",
            "platform": "instagram"
        },
        {
            "rank": 4,
            "title": "Apply to one local farmers market or pop-up",
            "why": "Pop-ups build your in-person brand, generate content, and turn Instagram followers into loyal buyers. One weekend market can bring 50–200 new local followers and direct sales with zero ad spend.",
            "time_estimate": "30 min to apply",
            "expected_impact": "50–200 new local followers + direct sales",
            "platform": "all"
        },
        {
            "rank": 5,
            "title": "List Valentina's on Goldbelly or Amazon Handmade",
            "why": "Goldbelly specializes in artisan food brands and comes with built-in traffic from buyers actively looking for small-batch products. One listing can take Valentina's from local to national in under 30 days.",
            "time_estimate": "1–2 hrs to set up listing",
            "expected_impact": "First national order within 30 days",
            "platform": "all"
        }
    ],
    "mock": True
}


async def generate_growth_plan(
    creator_type: str,
    stage: str,
    platforms: list,
    completed_mission_ids: list,
    onboarding: Optional[dict] = None,
) -> dict:
    if MOCK_MODE or not ANTHROPIC_API_KEY:
        return MOCK_GROWTH_PLAN

    platform_summary = ", ".join(
        f"{p['platform']} ({p.get('followers', 0):,} followers)" for p in platforms
    )
    completed_summary = (
        ", ".join(completed_mission_ids) if completed_mission_ids else "none yet"
    )

    onboarding_context = ""
    if onboarding:
        lines = [f"  - {k}: {v}" for k, v in onboarding.items()]
        onboarding_context = "Their onboarding answers:\n" + "\n".join(lines) + "\n\n"

    prompt = (
        f"You are a social media growth strategist helping a {creator_type} content creator "
        f"at the '{stage}' stage of their creator business.\n\n"
        f"Their current platform stats: {platform_summary}\n"
        f"Missions they have completed: {completed_summary}\n"
        f"{onboarding_context}"
        f"Generate a focused 30-day growth plan with exactly 5 prioritised actions. "
        f"Rank them by expected impact on follower growth and revenue. "
        f"Be specific — reference their actual platforms, follower counts, and business details in your reasoning. "
        f"Do not recommend things they have already completed.\n\n"
        f"Return a JSON object with these exact keys:\n"
        f"- plan_horizon: '30 days'\n"
        f"- biggest_opportunity: (string) one sentence identifying their single biggest growth lever right now\n"
        f"- actions: array of 5 objects, each with:\n"
        f"  - rank (integer 1-5)\n"
        f"  - title (string, concise action name)\n"
        f"  - why (string, 1-2 sentences explaining the impact using their specific numbers)\n"
        f"  - time_estimate (string, e.g. '3 hrs/week')\n"
        f"  - expected_impact (string, specific and measurable, e.g. '500-800 new followers in 30 days')\n"
        f"  - platform (string: instagram, tiktok, facebook, linkedin, email, or all)\n"
        f"- mock: false\n\n"
        f"Return only valid JSON, no explanation."
    )

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            "https://api.anthropic.com/v1/messages",
            headers={
                "x-api-key": ANTHROPIC_API_KEY,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            },
            json={
                "model": "claude-sonnet-4-6",
                "max_tokens": 1500,
                "messages": [{"role": "user", "content": prompt}],
            },
            timeout=30.0,
        )
        resp.raise_for_status()
        raw = resp.json()["content"][0]["text"].strip()
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        import json as _json
        return _json.loads(raw.strip())


async def analyze_seo_profile(
    platform: str,
    bio: str,
    creator_type: str,
    onboarding: Optional[dict] = None,
) -> dict:
    if MOCK_MODE or not ANTHROPIC_API_KEY:
        return _build_mock_seo_profile(creator_type, onboarding or {})

    onboarding_context = ""
    if onboarding:
        lines = [f"  - {k}: {v}" for k, v in onboarding.items()]
        onboarding_context = "Additional context about this creator:\n" + "\n".join(lines) + "\n\n"

    platform_context = (
        f"Instagram bios are indexed by Google. Keywords that people search when looking for "
        f"a {creator_type} creator to follow or hire should appear naturally in the bio. "
        f"A CTA drives profile-to-DM conversion for brand deals."
        if platform == "instagram"
        else
        f"TikTok profiles appear in TikTok search results and influence FYP recommendations. "
        f"A keyword-rich bio helps the algorithm understand your niche and surface your profile "
        f"when users search for your content type."
    )

    prompt = (
        f"You are an SEO strategist for {platform} social media profiles helping a {creator_type} "
        f"content creator maximize their profile's discoverability.\n\n"
        f"Current bio:\n\"{bio}\"\n\n"
        f"{onboarding_context}"
        f"Platform context: {platform_context}\n\n"
        f"Analyze this bio and return a JSON object with exactly these keys:\n"
        f"- score (integer 1-10: current SEO effectiveness of the bio as written)\n"
        f"- keywords_present (array of strings: niche keywords already in the bio that help discoverability)\n"
        f"- keywords_missing (array of 3-6 strings: high-value keywords this bio is missing for a {creator_type} creator on {platform})\n"
        f"- rewritten_bio (string: improved bio under 150 characters, weaves in missing keywords naturally, keeps the creator's voice, ends with a CTA)\n"
        f"- tips (array of exactly 5 strings: specific, actionable improvements each with a brief why)\n"
        f"- mock (boolean: false)\n\n"
        f"Return only valid JSON, no explanation, no markdown fences."
    )

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            "https://api.anthropic.com/v1/messages",
            headers={
                "x-api-key": ANTHROPIC_API_KEY,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            },
            json={
                "model": "claude-sonnet-4-6",
                "max_tokens": 1500,
                "messages": [{"role": "user", "content": prompt}],
            },
            timeout=30.0,
        )
        resp.raise_for_status()
        raw = resp.json()["content"][0]["text"].strip()
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        import json as _json
        try:
            return _json.loads(raw.strip())
        except _json.JSONDecodeError:
            fallback = dict(MOCK_SEO_PROFILE_ANALYSIS)
            fallback["parse_error"] = True
            return fallback


async def optimize_seo_content(
    platform: str,
    content: str,
    creator_type: str,
    onboarding: Optional[dict] = None,
) -> dict:
    if MOCK_MODE or not ANTHROPIC_API_KEY:
        return _build_mock_caption_result(content, creator_type, onboarding or {})

    onboarding_context = ""
    if onboarding:
        lines = [f"  - {k}: {v}" for k, v in onboarding.items()]
        onboarding_context = "Creator context:\n" + "\n".join(lines) + "\n\n"

    platform_rules = (
        "Instagram rules: Use 5–10 hashtags placed at the end of the caption (not 30 — that signals spam). "
        "The first 125 characters appear before 'more' in the feed — put your hook there. "
        "Use keyword-rich language in the body text, not only in hashtags."
        if platform == "instagram"
        else
        "TikTok rules: TikTok's search engine indexes caption text AND hashtags. Use 3–5 hashtags. "
        "Put your most important keyword in the first sentence. "
        "Keep total caption under 300 characters. The algorithm uses captions to categorize content."
    )

    prompt = (
        f"You are an SEO and content strategist for {platform}. Rewrite this caption to maximize "
        f"discoverability for a {creator_type} creator. Keep their authentic voice — do not make "
        f"it sound corporate or generic.\n\n"
        f"Original caption:\n\"{content}\"\n\n"
        f"{onboarding_context}"
        f"{platform_rules}\n\n"
        f"Return a JSON object with exactly these keys:\n"
        f"- original (string: the original caption, unchanged)\n"
        f"- optimized (string: the fully rewritten SEO-optimized caption with hashtags)\n"
        f"- keywords_added (array of strings: new keywords or hashtags added, without the # symbol)\n"
        f"- explanation (string: 2-4 sentences explaining what changed and why each change improves discoverability)\n"
        f"- mock (boolean: false)\n\n"
        f"Return only valid JSON, no explanation, no markdown fences."
    )

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            "https://api.anthropic.com/v1/messages",
            headers={
                "x-api-key": ANTHROPIC_API_KEY,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            },
            json={
                "model": "claude-sonnet-4-6",
                "max_tokens": 1500,
                "messages": [{"role": "user", "content": prompt}],
            },
            timeout=30.0,
        )
        resp.raise_for_status()
        raw = resp.json()["content"][0]["text"].strip()
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        import json as _json
        try:
            return _json.loads(raw.strip())
        except _json.JSONDecodeError:
            fallback = dict(MOCK_SEO_CONTENT_OPTIMIZATION)
            fallback["parse_error"] = True
            return fallback


MOCK_SEO_KEYWORDS = [
    {"keyword": "content creator", "relevance": "high"},
    {"keyword": "small business tips", "relevance": "high"},
    {"keyword": "entrepreneur", "relevance": "high"},
    {"keyword": "brand building", "relevance": "medium"},
    {"keyword": "social media growth", "relevance": "medium"},
    {"keyword": "creator economy", "relevance": "medium"},
    {"keyword": "side hustle", "relevance": "low"},
    {"keyword": "online business", "relevance": "low"},
]


async def generate_seo_keywords(
    creator_type: str,
    platform: str,
    niche: str = "",
    business_name: str = "",
) -> list:
    """Generate AI-powered SEO keywords based on the user's actual business context."""
    if MOCK_MODE or not ANTHROPIC_API_KEY:
        return _CREATOR_KEYWORDS.get(creator_type, _CREATOR_KEYWORDS["food"])

    context_parts = []
    if business_name:
        context_parts.append(f"Business name: {business_name}")
    if niche:
        context_parts.append(f"Niche/focus: {niche}")
    if creator_type:
        context_parts.append(f"Creator type: {creator_type}")
    context = "\n".join(context_parts)

    prompt = (
        f"You are an SEO strategist for social media. Generate 12 high-value SEO keywords "
        f"for a content creator on {platform}.\n\n"
        f"{context}\n\n"
        f"Return a JSON array of 12 objects with these exact keys:\n"
        f"- keyword (string: the keyword or short phrase, no # symbol)\n"
        f"- relevance (string: 'high', 'medium', or 'low')\n\n"
        f"Prioritize keywords specific to their niche and business — not generic creator terms. "
        f"Return only valid JSON, no explanation."
    )

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            "https://api.anthropic.com/v1/messages",
            headers={
                "x-api-key": ANTHROPIC_API_KEY,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            },
            json={
                "model": "claude-sonnet-4-6",
                "max_tokens": 800,
                "messages": [{"role": "user", "content": prompt}],
            },
            timeout=30.0,
        )
        resp.raise_for_status()
        raw = resp.json()["content"][0]["text"].strip()
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        import json as _json
        try:
            return _json.loads(raw.strip())
        except _json.JSONDecodeError:
            return MOCK_SEO_KEYWORDS
