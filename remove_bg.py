#!/usr/bin/env python3
"""
Remove ONLY the outer white background from the logo using flood-fill
from the corners/edges. This preserves white highlights inside the logo art.
"""
from PIL import Image
from collections import deque

def flood_fill_transparent(img_rgba, tolerance=20):
    """
    Flood-fill from all 4 corners/edges to find connected white background pixels.
    Only those connected to the outer edge get made transparent.
    """
    width, height = img_rgba.size
    pixels = img_rgba.load()
    visited = [[False] * height for _ in range(width)]
    
    def is_white(x, y):
        r, g, b, a = pixels[x, y]
        return (r >= 255 - tolerance and 
                g >= 255 - tolerance and 
                b >= 255 - tolerance and 
                a > 0)
    
    # Seed the flood fill from all edge pixels that are white-ish
    queue = deque()
    for x in range(width):
        for y in [0, height - 1]:
            if not visited[x][y] and is_white(x, y):
                queue.append((x, y))
                visited[x][y] = True
    for y in range(height):
        for x in [0, width - 1]:
            if not visited[x][y] and is_white(x, y):
                queue.append((x, y))
                visited[x][y] = True
    
    # BFS flood fill
    count = 0
    while queue:
        x, y = queue.popleft()
        r, g, b, a = pixels[x, y]
        
        # Make fully transparent
        pixels[x, y] = (r, g, b, 0)
        count += 1
        
        # Check 4-connected neighbors
        for nx, ny in [(x-1, y), (x+1, y), (x, y-1), (x, y+1)]:
            if 0 <= nx < width and 0 <= ny < height and not visited[nx][ny]:
                visited[nx][ny] = True
                if is_white(nx, ny):
                    queue.append((nx, ny))
    
    print(f"   Removed {count:,} background pixels via flood fill")
    
    # Second pass: clean up semi-transparent edge fringing
    # For pixels adjacent to transparent ones that are very light, feather them
    new_pixels = {}
    for x in range(width):
        for y in range(height):
            r, g, b, a = pixels[x, y]
            if a == 0:
                continue
            # Check if any neighbor is transparent (edge pixel)
            has_transparent_neighbor = False
            for nx, ny in [(x-1,y),(x+1,y),(x,y-1),(x,y+1)]:
                if 0 <= nx < width and 0 <= ny < height:
                    nr, ng, nb, na = pixels[nx, ny]
                    if na == 0:
                        has_transparent_neighbor = True
                        break
            if has_transparent_neighbor:
                # Feather based on how white this edge pixel is
                whiteness = (r + g + b) / (3 * 255)
                if whiteness > 0.85:
                    new_alpha = int(a * (1 - whiteness) * 3)
                    new_pixels[(x, y)] = (r, g, b, max(0, new_alpha))
    
    for (x, y), rgba in new_pixels.items():
        pixels[x, y] = rgba
    
    print(f"   Feathered {len(new_pixels):,} edge pixels")
    return img_rgba


def main():
    input_path = "assets/logo.png"
    output_path = "assets/logo-transparent.png"
    
    print(f"Processing: {input_path}")
    img = Image.open(input_path).convert("RGBA")
    print(f"   Size: {img.size}")
    
    result = flood_fill_transparent(img, tolerance=22)
    result.save(output_path, "PNG", optimize=False)
    
    print(f"✅ Saved: {output_path}")


if __name__ == "__main__":
    main()
